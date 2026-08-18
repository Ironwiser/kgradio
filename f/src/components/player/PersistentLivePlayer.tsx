import { useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import { Player } from "@/components/player/Player"
import { useAzuraCastNowPlaying } from "@/hooks/useAzuraCastNowPlaying"
import { useMobileLayout } from "@/hooks/useMobileLayout"

const LIVE_STREAM_URL = "https://radio.lowradio.com/listen/lowradio/radio.mp3"
const NOW_PLAYING_URL = "https://radio.lowradio.com/api/nowplaying/lowradio"
const LIVE_PERSIST_KEY = "lowradio-live-playback-persist"
const ARCHIVE_PERSIST_KEY = "lowradio-archive-playback-persist"
const ARCHIVE_SNAPSHOT_KEY = "lowradio-archive-playback-snapshot"
const PERSIST_EVENT = "lowradio-playback-persist-change"

type ArchiveSnapshot = {
  src: string
  title: string
  trackName: string
  artworkUrl?: string | null
}

function readPersistedPlayback() {
  const live = localStorage.getItem(LIVE_PERSIST_KEY) === "true"
  const archive = localStorage.getItem(ARCHIVE_PERSIST_KEY) === "true"
  let archiveSnapshot: ArchiveSnapshot | null = null
  try {
    archiveSnapshot = JSON.parse(localStorage.getItem(ARCHIVE_SNAPSHOT_KEY) || "null")
  } catch {
    archiveSnapshot = null
  }
  return { live, archive, archiveSnapshot }
}

export function PersistentLivePlayer({ pathname }: { pathname: string }) {
  const isMobile = useMobileLayout()
  const [persisted, setPersisted] = useState(readPersistedPlayback)
  const popupRef = useRef<HTMLElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const { snapshot } = useAzuraCastNowPlaying(NOW_PLAYING_URL)
  const currentTrack = snapshot.currentSong

  useEffect(() => {
    const sync = () => setPersisted(readPersistedPlayback())
    window.addEventListener(PERSIST_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(PERSIST_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const showLive = persisted.live && pathname !== "/" && pathname !== "/canli"
  const showArchive = persisted.archive && !!persisted.archiveSnapshot && pathname !== "/calma-listeleri"
  const mode = showLive ? "live" : showArchive ? "archive" : null
  if (isMobile || !mode) return null

  const disablePersistentPlayback = () => {
    localStorage.setItem(mode === "live" ? LIVE_PERSIST_KEY : ARCHIVE_PERSIST_KEY, "false")
    window.dispatchEvent(new Event(PERSIST_EVENT))
  }

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    const popup = popupRef.current
    if (!popup) return
    const rect = popup.getBoundingClientRect()
    dragOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPosition({ left: rect.left, top: rect.top })
  }

  const handleDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const popup = popupRef.current
    if (!popup) return
    const maxLeft = Math.max(0, window.innerWidth - popup.offsetWidth)
    const maxTop = Math.max(0, window.innerHeight - popup.offsetHeight)
    setPosition({
      left: Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetRef.current.x)),
      top: Math.min(maxTop, Math.max(0, event.clientY - dragOffsetRef.current.y)),
    })
  }

  const handleDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const archive = persisted.archiveSnapshot
  const playerProps = mode === "live"
    ? {
        src: LIVE_STREAM_URL,
        title: snapshot.stationName || "LOWRadio",
        trackName: currentTrack ? `${currentTrack.artist} — ${currentTrack.title}` : undefined,
        artworkUrl: currentTrack?.artworkUrl,
      }
    : {
        src: archive!.src,
        title: archive!.title,
        trackName: archive!.trackName,
        artworkUrl: archive!.artworkUrl || undefined,
      }

  return (
    <aside
      ref={popupRef}
      className="persistent-live-popup"
      aria-label="Devam eden LOWRadio yayını"
      style={position ? ({ left: position.left, top: position.top, right: "auto", bottom: "auto" } as CSSProperties) : undefined}
    >
      <header
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <p><span aria-hidden /> {mode === "live" ? "YAYIN DEVAM EDİYOR" : "ARŞİV ÇALMAYA DEVAM EDİYOR"}</p>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={disablePersistentPlayback} aria-label="Popup playerı kapat">×</button>
      </header>
      <Player
        {...playerProps}
        isLive={mode === "live"}
        allowPersistentPlayback={mode === "archive"}
        className="editorial-player persistent-live-popup-player"
      />
    </aside>
  )
}
