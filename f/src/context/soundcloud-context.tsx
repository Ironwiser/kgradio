import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"

export type SoundCloudItem = {
  id: number
  kind: "track" | "playlist"
  url: string
  title: string
  authorName?: string | null
  artworkUrl?: string | null
}

type SoundCloudContextValue = {
  current: SoundCloudItem | null
  isPlaying: boolean
  persistent: boolean
  play: (item: SoundCloudItem) => void
  setPersistent: (value: boolean) => void
}

declare global {
  interface Window { SC?: { Widget: ((iframe: HTMLIFrameElement) => SoundCloudWidget) & { Events: Record<string, string> } } }
}
type SoundCloudWidget = {
  bind: (event: string, callback: () => void) => void
  load: (url: string, options?: Record<string, unknown>) => void
  play: () => void
  pause: () => void
  getPosition: (callback: (position: number) => void) => void
  seekTo: (position: number) => void
}

const Context = createContext<SoundCloudContextValue | null>(null)
const PERSIST_KEY = "lowradio-soundcloud-popup-mode"
const PLAYBACK_PERSIST_EVENT = "lowradio-playback-persist-change"
const EXTERNAL_PLAYBACK_EVENT = "lowradio-external-playback-start"

function widgetUrl(url: string) {
  const encoded = encodeURIComponent(url)
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff3038&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
}

function PopupScrollingTitle({ text }: { text: string }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflowDistance, setOverflowDistance] = useState(0)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const title = textRef.current
    if (!viewport || !title) return
    const measure = () => setOverflowDistance(Math.max(0, title.scrollWidth - viewport.clientWidth + 12))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(title)
    return () => observer.disconnect()
  }, [text])

  return <div
    ref={viewportRef}
    className="soundcloud-popup-title-window"
    data-overflow={overflowDistance > 0 ? "true" : "false"}
    style={{ "--soundcloud-popup-title-distance": `${overflowDistance}px` } as CSSProperties}
    title={text}
  >
    <div className="soundcloud-popup-title-track">
      <span ref={textRef}>{text}</span>
      {overflowDistance > 0 && <span aria-hidden="true">{text}</span>}
    </div>
  </div>
}

export function SoundCloudProvider({ children, pathname }: { children: ReactNode; pathname: string }) {
  const [current, setCurrent] = useState<SoundCloudItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [persistent, setPersistentState] = useState(() => localStorage.getItem(PERSIST_KEY) === "true")
  const [surface, setSurface] = useState<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const widgetRef = useRef<SoundCloudWidget | null>(null)
  const pendingPlayRef = useRef(false)
  const pendingSeekRef = useRef<number | null>(null)
  const movePositionRef = useRef<number | undefined>(undefined)
  const resumeAfterMoveRef = useRef(false)
  const isPlayingRef = useRef(false)
  const popupRef = useRef<HTMLElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null)
  // Popup modu rotadan bağımsızdır. Açıldıktan sonra kullanıcı kapatana kadar
  // oynatıcı hiçbir sayfada tekrar satır içine taşınmaz.
  const showPopup = Boolean(current && persistent)

  useLayoutEffect(() => {
    const selector = persistent
      ? ".soundcloud-persistent-popup .soundcloud-widget-surface"
      : ".soundcloud-inline-player .soundcloud-widget-surface"
    const findSurface = () => {
      const nextSurface = document.querySelector<HTMLDivElement>(selector)
      setSurface((previous) => previous === nextSurface ? previous : nextSurface)
    }
    findSurface()
    const observer = new MutationObserver(findSurface)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [persistent, pathname, current?.id])

  useEffect(() => {
    if (!document.querySelector('script[data-lowradio-soundcloud]')) {
      const script = document.createElement("script")
      script.src = "https://w.soundcloud.com/player/api.js"
      script.async = true
      script.dataset.lowradioSoundcloud = "true"
      document.head.appendChild(script)
    }
    return () => {
      try { widgetRef.current?.pause() } catch { /* widget penceresi kapanmış olabilir */ }
      iframeRef.current?.remove()
      iframeRef.current = null
      widgetRef.current = null
    }
  }, [])

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  const initialiseWidget = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !window.SC?.Widget) return null
    if (!widgetRef.current) {
      const widget = window.SC.Widget(iframe)
      widgetRef.current = widget
      const events = window.SC.Widget.Events
      widget.bind(events.PLAY, () => {
        setIsPlaying(true)
        window.dispatchEvent(new CustomEvent(EXTERNAL_PLAYBACK_EVENT, { detail: { source: "soundcloud" } }))
      })
      widget.bind(events.PAUSE, () => setIsPlaying(false))
      widget.bind(events.FINISH, () => setIsPlaying(false))
      widget.bind(events.READY, () => {
        if (pendingSeekRef.current !== null) {
          widget.seekTo(pendingSeekRef.current)
          pendingSeekRef.current = null
        }
        if (pendingPlayRef.current || resumeAfterMoveRef.current) {
          pendingPlayRef.current = false
          resumeAfterMoveRef.current = false
          widget.play()
        }
      })
    }
    return widgetRef.current
  }, [])

  useLayoutEffect(() => {
    if (!surface || !current) return
    let cancelled = false
    let mounted = false
    let connectTimer: number | null = null
    let positionTimer: number | null = null

    const mountFreshWidget = (position: number | null, shouldResume: boolean) => {
      if (cancelled || mounted) return
      mounted = true
      try { widgetRef.current?.pause() } catch { /* eski iframe kapanmış olabilir */ }
      iframeRef.current?.remove()
      widgetRef.current = null

      const iframe = document.createElement("iframe")
      iframe.title = "SoundCloud oynatıcı"
      iframe.allow = "autoplay"
      iframe.scrolling = "no"
      iframe.frameBorder = "0"
      iframe.className = "soundcloud-native-frame"
      iframe.src = widgetUrl(current.url)
      iframeRef.current = iframe
      pendingSeekRef.current = position
      resumeAfterMoveRef.current = shouldResume
      surface.appendChild(iframe)

      const connect = () => {
        if (cancelled) return
        if (window.SC?.Widget) initialiseWidget()
        else connectTimer = window.setTimeout(connect, 100)
      }
      connect()
    }

    const oldWidget = widgetRef.current
    const oldIframe = iframeRef.current
    const shouldResume = isPlayingRef.current || pendingPlayRef.current
    if (movePositionRef.current !== undefined) {
      const savedPosition = movePositionRef.current
      movePositionRef.current = undefined
      mountFreshWidget(savedPosition, shouldResume)
    } else if (oldWidget && oldIframe?.src) {
      try { oldWidget.getPosition((position) => mountFreshWidget(position, shouldResume)) }
      catch { mountFreshWidget(null, shouldResume) }
      positionTimer = window.setTimeout(() => mountFreshWidget(null, shouldResume), 300)
    } else {
      mountFreshWidget(null, shouldResume)
    }

    return () => {
      cancelled = true
      if (connectTimer !== null) window.clearTimeout(connectTimer)
      if (positionTimer !== null) window.clearTimeout(positionTimer)
    }
  }, [surface, initialiseWidget])

  const play = useCallback((item: SoundCloudItem) => {
    setCurrent(item)
    pendingPlayRef.current = true
    const iframe = iframeRef.current
    if (!iframe) return
    const widget = initialiseWidget()
    if (widget) widget.load(item.url, { auto_play: true, color: "#ff3038", hide_related: true, show_comments: false, show_reposts: false, visual: true })
  }, [initialiseWidget])

  const setPersistent = useCallback((value: boolean) => {
    const commit = (position?: number) => {
      if (position !== undefined) movePositionRef.current = position
      localStorage.setItem(PERSIST_KEY, String(value))
      if (value) {
        localStorage.setItem("lowradio-live-playback-persist", "false")
        localStorage.setItem("lowradio-archive-playback-persist", "false")
        window.dispatchEvent(new Event(PLAYBACK_PERSIST_EVENT))
        window.dispatchEvent(new CustomEvent(EXTERNAL_PLAYBACK_EVENT, { detail: { source: "soundcloud" } }))
      }
      setPersistentState(value)
    }

    const widget = widgetRef.current
    if (!widget) {
      commit()
      return
    }

    let committed = false
    const finish = (position?: number) => {
      if (committed) return
      committed = true
      commit(position)
    }
    try { widget.getPosition((position) => finish(position)) }
    catch { finish() }
    window.setTimeout(() => finish(), 300)
  }, [])

  useEffect(() => {
    const syncPopupMode = () => {
      const enabled = localStorage.getItem(PERSIST_KEY) === "true"
      setPersistentState(enabled)
      if (!enabled) {
        try { widgetRef.current?.pause() } catch { /* widget penceresi kapanmış olabilir */ }
      }
    }
    window.addEventListener(PLAYBACK_PERSIST_EVENT, syncPopupMode)
    window.addEventListener("storage", syncPopupMode)
    return () => {
      window.removeEventListener(PLAYBACK_PERSIST_EVENT, syncPopupMode)
      window.removeEventListener("storage", syncPopupMode)
    }
  }, [])

  useEffect(() => {
    if (pathname !== "/calma-listeleri" && !persistent) {
      try { widgetRef.current?.pause() } catch { /* iframe kapanmış olabilir */ }
      setIsPlaying(false)
      setSurface(null)
    }
  }, [pathname, persistent])

  useEffect(() => {
    const stop = (event: Event) => {
      if ((event as CustomEvent<{ source?: string }>).detail?.source === "html-audio") {
        try { widgetRef.current?.pause() } catch { /* iframe kapanmış olabilir */ }
      }
    }
    window.addEventListener(EXTERNAL_PLAYBACK_EVENT, stop)
    return () => window.removeEventListener(EXTERNAL_PLAYBACK_EVENT, stop)
  }, [])

  const value = useMemo(() => ({ current, isPlaying, persistent, play, setPersistent }), [current, isPlaying, persistent, play, setPersistent])

  const handlePopupDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const popup = popupRef.current
    if (!popup) return
    const rect = popup.getBoundingClientRect()
    dragOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPopupPosition({ left: rect.left, top: rect.top })
  }

  const handlePopupDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const popup = popupRef.current
    if (!popup) return
    const maxLeft = Math.max(0, window.innerWidth - popup.offsetWidth)
    const maxTop = Math.max(0, window.innerHeight - popup.offsetHeight)
    setPopupPosition({
      left: Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetRef.current.x)),
      top: Math.min(maxTop, Math.max(0, event.clientY - dragOffsetRef.current.y)),
    })
  }

  const handlePopupDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return <Context.Provider value={value}>
    {children}
    {showPopup && <aside
      ref={popupRef}
      className="soundcloud-persistent-popup"
      style={popupPosition ? ({ left: popupPosition.left, top: popupPosition.top, right: "auto", bottom: "auto" } as CSSProperties) : undefined}
    >
      <div
        className="soundcloud-popup-label"
        onPointerDown={handlePopupDragStart}
        onPointerMove={handlePopupDragMove}
        onPointerUp={handlePopupDragEnd}
        onPointerCancel={handlePopupDragEnd}
      ><span /> SOUNDCLOUD PLAYER</div>
      <PopupScrollingTitle text={current?.title || ""} />
      <div className="soundcloud-widget-surface" />
      <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => setPersistent(false)} aria-label="Popup oynatıcıyı kapat">×</button>
    </aside>}
  </Context.Provider>
}

export function SoundCloudSurface({ className = "" }: { className?: string }) {
  const context = useSoundCloud()
  return <div className={`soundcloud-widget-shell ${className}`}>
    {!context.persistent && <div className="soundcloud-widget-surface" />}
    <label className="soundcloud-persist-toggle">
      <input type="checkbox" checked={context.persistent} onChange={(event) => context.setPersistent(event.target.checked)} />
      <span /> PLAYER'I POPUP'A AL
    </label>
  </div>
}

export function useSoundCloud() {
  const value = useContext(Context)
  if (!value) throw new Error("useSoundCloud, SoundCloudProvider içinde kullanılmalı")
  return value
}
