"use client"

import * as React from "react"
import { Music } from "lucide-react"
import { cn } from "@/lib/utils"

type GlyphProps = { className?: string }
const PLAYER_ERROR_MESSAGE = "Yayın şu anda açılamıyor. Biraz sonra tekrar deneyin."
type PlaybackPersistKind = "live" | "archive"
const PLAYBACK_PERSIST_KEYS: Record<PlaybackPersistKind, string> = {
  live: "lowradio-live-playback-persist",
  archive: "lowradio-archive-playback-persist",
}
const PLAYBACK_PERSIST_EVENT = "lowradio-playback-persist-change"
const ARCHIVE_PLAYBACK_SNAPSHOT_KEY = "lowradio-archive-playback-snapshot"
const EXTERNAL_PLAYBACK_EVENT = "lowradio-external-playback-start"
const sharedLiveAudio = typeof Audio !== "undefined" ? new Audio() : null
if (sharedLiveAudio) {
  sharedLiveAudio.crossOrigin = "anonymous"
  sharedLiveAudio.preload = "none"
}
const sharedLiveAudioRef: React.RefObject<HTMLAudioElement | null> = { current: sharedLiveAudio }
const sharedArchiveAudio = typeof Audio !== "undefined" ? new Audio() : null
if (sharedArchiveAudio) {
  sharedArchiveAudio.crossOrigin = "anonymous"
  sharedArchiveAudio.preload = "none"
}
const sharedArchiveAudioRef: React.RefObject<HTMLAudioElement | null> = { current: sharedArchiveAudio }
let sharedLiveAudioContext: AudioContext | null = null
let sharedLiveAnalyser: AnalyserNode | null = null
const activePersistentPlayers: Record<PlaybackPersistKind, number> = { live: 0, archive: 0 }
let activePlayerAudio: HTMLAudioElement | null = null

function getPlaybackPersistPreference(kind: PlaybackPersistKind) {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(PLAYBACK_PERSIST_KEYS[kind]) === "true"
}

function getFreshLiveStreamUrl(src: string) {
  const url = new URL(src, window.location.href)
  url.searchParams.set("_lowradio_live", Date.now().toString())
  return url.href
}

function getSharedLiveAnalyser(audio: HTMLAudioElement) {
  if (sharedLiveAnalyser) return sharedLiveAnalyser
  const context = new window.AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.82
  const source = context.createMediaElementSource(audio)
  source.connect(analyser)
  analyser.connect(context.destination)
  sharedLiveAudioContext = context
  sharedLiveAnalyser = analyser
  return analyser
}

function LiveWaveform({
  audioRef,
  isPlaying,
  shared = false,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  shared?: boolean
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null)
  const silentFramesRef = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const audio = audioRef.current
    if (!canvas || !audio) return

    let animationFrame = 0

    const prepareAnalyser = () => {
      if (shared) return getSharedLiveAnalyser(audio)
      if (analyserRef.current) return analyserRef.current
      const AudioContextClass = window.AudioContext
      const context = audioContextRef.current ?? new AudioContextClass()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      const source = context.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(context.destination)
      audioContextRef.current = context
      analyserRef.current = analyser
      sourceRef.current = source
      return analyser
    }

    const draw = () => {
      const context2d = canvas.getContext("2d")
      if (!context2d) return
      const dpr = window.devicePixelRatio || 1
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      context2d.clearRect(0, 0, width, height)
      context2d.beginPath()
      context2d.lineWidth = Math.max(1.5, 1.5 * dpr)
      context2d.strokeStyle = "#ff3035"
      context2d.lineCap = "round"
      context2d.lineJoin = "round"

      const analyser = shared ? sharedLiveAnalyser : analyserRef.current
      if (isPlaying && analyser) {
        const samples = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteTimeDomainData(samples)
        const peak = samples.reduce((largest, sample) => Math.max(largest, Math.abs(sample - 128)), 0)
        silentFramesRef.current = peak < 2 ? silentFramesRef.current + 1 : 0
        const useSignalFallback = silentFramesRef.current > 18
        samples.forEach((sample, index) => {
          const x = (index / (samples.length - 1)) * width
          const fallbackSignal =
            Math.sin(index * .31 + performance.now() * .006) * .12 +
            Math.sin(index * .11 - performance.now() * .003) * .06
          const normalized = useSignalFallback ? fallbackSignal : (sample - 128) / 128
          const y = height / 2 + normalized * height * 0.38
          if (index === 0) context2d.moveTo(x, y)
          else context2d.lineTo(x, y)
        })
      } else {
        context2d.moveTo(0, height / 2)
        context2d.lineTo(width, height / 2)
      }
      context2d.stroke()
      animationFrame = window.requestAnimationFrame(draw)
    }

    if (isPlaying) {
      try {
        const analyser = prepareAnalyser()
        const activeContext = shared ? sharedLiveAudioContext : audioContextRef.current
        if (analyser && activeContext?.state === "suspended") {
          void activeContext.resume()
        }
      } catch {
        // CORS veya Web Audio desteği yoksa düz çizgi gösterilir; yayın etkilenmez.
      }
    }
    draw()

    return () => window.cancelAnimationFrame(animationFrame)
  }, [audioRef, isPlaying, shared])

  React.useEffect(() => () => {
    if (shared) return
    sourceRef.current?.disconnect()
    analyserRef.current?.disconnect()
    void audioContextRef.current?.close()
  }, [shared])

  return (
    <div className="live-waveform" aria-label={isPlaying ? "Canlı ses sinyali" : "Yayın duraklatıldı"}>
      <canvas ref={canvasRef} aria-hidden />
      <span>{isPlaying ? "CANLI" : "BEKLEMEDE"}</span>
    </div>
  )
}

function PlayGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden fill="currentColor">
      <path d="M240 128a15.74 15.74 0 0 1-7.6 13.51l-144 88A16 16 0 0 1 64 216V40a16 16 0 0 1 24.4-13.51l144 88A15.74 15.74 0 0 1 240 128Z" />
    </svg>
  )
}

function PauseGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="6.5" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" />
      <rect x="14" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="1" opacity=".38" />
    </svg>
  )
}

function SignalGlyph({ muted = false, className }: GlyphProps & { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="7" cy="12" r="2" fill="currentColor" />
      {muted ? (
        <>
          <path d="m11 8 7 8M18 8l-7 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M11 8.5c1.8 1.75 1.8 5.25 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 5.75c3.45 3.25 3.45 9.25 0 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function StepGlyph({ direction, className }: GlyphProps & { direction: "back" | "forward" }) {
  const transform = direction === "back" ? "translate(24 0) scale(-1 1)" : undefined
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <g transform={transform}>
        <path d="M7 5.5v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m10 7 7.5 5-7.5 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="18.5" cy="12" r="1" fill="currentColor" />
      </g>
    </svg>
  )
}

function ScrollingTrackName({ text }: { text: string }) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const textRef = React.useRef<HTMLParagraphElement>(null)
  const [overflowDistance, setOverflowDistance] = React.useState(0)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const textElement = textRef.current
    if (!viewport || !textElement) return

    const measure = () => {
      setOverflowDistance(Math.max(0, textElement.scrollWidth - viewport.clientWidth + 18))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(textElement)
    return () => observer.disconnect()
  }, [text])

  return (
    <div
      ref={viewportRef}
      className="player-track-name-window player-track-transition"
      data-overflow={overflowDistance > 0 ? "true" : "false"}
      style={{ "--player-track-distance": `${overflowDistance}px` } as React.CSSProperties}
    >
      <p
        ref={textRef}
        className="text-sm font-semibold text-white sm:text-base md:text-lg"
        title={text}
      >
        {text}
      </p>
    </div>
  )
}

export interface PlayerProps {
  /** Stream veya MP3 URL. Boşsa player hazır bekler. */
  src?: string
  /** Opsiyonel başlık (örn. istasyon adı) */
  title?: string
  /** Çalan parça adı (verilirse API'den çekilmez; listeden seçim için) */
  trackName?: string
  /** Parça/albüm kapak görseli URL (opsiyonel) */
  artworkUrl?: string
  /** Çalan parça adını almak için API URL (trackName yoksa kullanılır) */
  trackInfoUrl?: string
  /** true ise src değişince otomatik oynat (listeden tıklanınca) */
  autoPlay?: boolean
  /** Canlı akışlarda yanıltıcı seek davranışını kapatır. */
  isLive?: boolean
  /** Arşiv kaydının diğer sayfalarda popup player ile sürmesini sağlar. */
  allowPersistentPlayback?: boolean
  /** Kalıcı ses örneğini popup içinde gösteren dahili player. */
  isPersistentPopup?: boolean
  /** Önceki parçaya geç (liste varsa) */
  onPrevious?: () => void
  /** Sonraki parçaya geç (liste varsa) */
  onNext?: () => void
  /** Önceki parça var mı (buton disabled) */
  canGoPrevious?: boolean
  /** Sonraki parça var mı (buton disabled) */
  canGoNext?: boolean
  className?: string
}

export function Player({ src, title, trackName: trackNameProp, artworkUrl, trackInfoUrl, autoPlay, isLive = false, allowPersistentPlayback = false, isPersistentPopup = false, onPrevious, onNext, canGoPrevious = true, canGoNext = true, className }: PlayerProps) {
  const localAudioRef = React.useRef<HTMLAudioElement>(null)
  const persistenceKind: PlaybackPersistKind | null = isLive ? "live" : allowPersistentPlayback ? "archive" : null
  const persistentAudio = persistenceKind === "live" ? sharedLiveAudio : persistenceKind === "archive" ? sharedArchiveAudio : null
  const audioRef = persistenceKind === "live" ? sharedLiveAudioRef : persistenceKind === "archive" ? sharedArchiveAudioRef : localAudioRef
  const [isPlaying, setIsPlaying] = React.useState(() => {
    if (!persistentAudio || !persistenceKind) return false
    return getPlaybackPersistPreference(persistenceKind) && !persistentAudio.paused
  })
  const [volume, setVolume] = React.useState(() => persistentAudio?.volume ?? 1)
  const [isMuted, setIsMuted] = React.useState(() => persistentAudio?.muted ?? false)
  const [persistPlayback, setPersistPlayback] = React.useState(() => persistenceKind ? getPlaybackPersistPreference(persistenceKind) : false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [trackName, setTrackName] = React.useState<string | null>(null)
  /** trackInfoUrl yanıtından gelen kapak (prop yoksa kullanılır) */
  const [artworkFromApi, setArtworkFromApi] = React.useState<string | null>(null)
  /** Kapak URL'si var ama yükleme başarısız (404 vb.) — placeholder göster */
  const [artworkLoadFailed, setArtworkLoadFailed] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volumeOpen, setVolumeOpen] = React.useState(false)
  const [volumeLayout, setVolumeLayout] = React.useState<"inline" | "popover">("inline")
  const controlsRowRef = React.useRef<HTMLDivElement>(null)
  const primaryControlsRef = React.useRef<HTMLDivElement>(null)
  const volumeRef = React.useRef<HTMLDivElement>(null)
  const volumeCloseTimerRef = React.useRef<number | null>(null)
  const isSeekingRef = React.useRef(false)

  const cancelVolumeClose = React.useCallback(() => {
    if (volumeCloseTimerRef.current !== null) {
      window.clearTimeout(volumeCloseTimerRef.current)
      volumeCloseTimerRef.current = null
    }
  }, [])

  React.useEffect(() => () => cancelVolumeClose(), [cancelVolumeClose])

  React.useEffect(() => {
    if (!persistenceKind) return
    const syncPreference = () => {
      setPersistPlayback(getPlaybackPersistPreference(persistenceKind))
    }
    window.addEventListener(PLAYBACK_PERSIST_EVENT, syncPreference)
    window.addEventListener("storage", syncPreference)
    return () => {
      window.removeEventListener(PLAYBACK_PERSIST_EVENT, syncPreference)
      window.removeEventListener("storage", syncPreference)
    }
  }, [persistenceKind])

  React.useEffect(() => {
    if (!persistenceKind) return
    activePersistentPlayers[persistenceKind] += 1
    return () => {
      activePersistentPlayers[persistenceKind] -= 1
      // Kalıcı oynatma kapalıysa bu player sayfadan ayrıldığı anda sesi kesin
      // olarak durdur. Rota geçişinde yeni player eski cleanup'tan önce mount
      // olabildiği için yalnızca aktif örnek sayısına güvenmek otomatik yeniden
      // başlamaya yol açıyordu.
      // Popup kapatıldığında aynı ortak audio sayfadaki player tarafından
      // devralınır; popup örneğinin cleanup'ı yayını durdurmamalı.
      const currentPath = window.location.pathname
      const isLivePageHandoff = persistenceKind === "live" && (currentPath === "/" || currentPath === "/canli")
      if (!getPlaybackPersistPreference(persistenceKind) && !isPersistentPopup && !isLivePageHandoff) {
        const audio = audioRef.current
        audio?.pause()
      }
    }
  }, [audioRef, isPersistentPopup, persistenceKind])

  React.useEffect(() => {
    const controlsRow = controlsRowRef.current
    const primaryControls = primaryControlsRef.current
    if (!controlsRow || !primaryControls) return

    const updateVolumeLayout = () => {
      const styles = window.getComputedStyle(controlsRow)
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
      const availableWidth = controlsRow.clientWidth - primaryControls.offsetWidth - gap
      setVolumeLayout(availableWidth >= 156 ? "inline" : "popover")
    }

    updateVolumeLayout()
    const observer = new ResizeObserver(updateVolumeLayout)
    observer.observe(controlsRow)
    observer.observe(primaryControls)
    return () => observer.disconnect()
  }, [onPrevious, onNext])

  /** Dışarı tıklanınca volume panelini kapat (mobil) */
  React.useEffect(() => {
    if (!volumeOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setVolumeOpen(false)
      }
    }
    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [volumeOpen])

  const handleVolumeButtonPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      setVolumeOpen((o) => !o)
      e.preventDefault()
    }
  }

  const togglePlay = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      if (isLive) {
        audio.removeAttribute("src")
        audio.load()
        setCurrentTime(0)
        setDuration(0)
      }
    } else {
      setError(null)
      setIsLoading(true)
      if (isLive && src) {
        // Canlı akış hiçbir zaman bekleyen eski tamponu kullanmaz. Her manuel
        // başlangıç AzuraCast'in o anki canlı ucuna yeni bir bağlantı açar.
        audio.pause()
        audio.removeAttribute("src")
        audio.load()
        audio.src = getFreshLiveStreamUrl(src)
        audio.load()
      }
      audio.play().catch(() => {
        setError(PLAYER_ERROR_MESSAGE)
        setIsPlaying(false)
      }).finally(() => setIsLoading(false))
    }
    setIsPlaying(!isPlaying)
  }, [isLive, isPlaying, src])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => {
      if (activePlayerAudio && activePlayerAudio !== audio) {
        activePlayerAudio.pause()
      }
      activePlayerAudio = audio
      window.dispatchEvent(new CustomEvent(EXTERNAL_PLAYBACK_EVENT, { detail: { source: "html-audio" } }))
      setIsPlaying(true)
      setError(null)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onError = () => {
      setError(PLAYER_ERROR_MESSAGE)
      setIsPlaying(false)
    }

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(audio.currentTime)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("durationchange", onDurationChange)
    setIsPlaying(!audio.paused)
    setVolume(audio.volume)
    setIsMuted(audio.muted)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("durationchange", onDurationChange)
    }
  }, [audioRef])

  React.useEffect(() => {
    const stopForExternalPlayer = (event: Event) => {
      if ((event as CustomEvent<{ source?: string }>).detail?.source === "soundcloud") {
        audioRef.current?.pause()
      }
    }
    window.addEventListener(EXTERNAL_PLAYBACK_EVENT, stopForExternalPlayer)
    return () => window.removeEventListener(EXTERNAL_PLAYBACK_EVENT, stopForExternalPlayer)
  }, [audioRef])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || src === undefined) return

    if (isLive) {
      const mayContinueAcrossPages = getPlaybackPersistPreference("live")
      const currentPath = window.location.pathname
      const isLivePageHandoff = currentPath === "/" || currentPath === "/canli"
      if ((mayContinueAcrossPages || isLivePageHandoff) && !audio.paused) {
        setIsPlaying(true)
        return
      }

      // Sayfa açılırken canlı URL'yi audio elementine bağlama. Böylece play
      // tıklanana kadar yayın indirilmez ve eski bir canlı tampon beklemez.
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      return
    }

    const nextSrc = new URL(src, window.location.href).href
    if (persistenceKind && audio.src === nextSrc) {
      const mayContinueAcrossPages = getPlaybackPersistPreference(persistenceKind)
      if (!mayContinueAcrossPages) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsPlaying(!audio.paused)
      }
      if (autoPlay && audio.paused && mayContinueAcrossPages) {
        void audio.play().catch(() => {})
      }
      return
    }
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    audio.src = src
    const shouldPlay = autoPlay || (isPlaying && (!persistenceKind || getPlaybackPersistPreference(persistenceKind)))
    if (shouldPlay) {
      setIsLoading(true)
      audio.play().catch((e: unknown) => {
        const name = (e as { name?: string })?.name
        if (name !== "NotAllowedError") setError("Çalınamadı.")
      }).finally(() => setIsLoading(false))
    }
  }, [src, autoPlay, audioRef, persistenceKind, isLive])

  React.useEffect(() => {
    if (persistenceKind !== "archive" || !persistPlayback || !src) return
    window.localStorage.setItem(ARCHIVE_PLAYBACK_SNAPSHOT_KEY, JSON.stringify({
      src,
      title: title || "LOWRadio Arşiv",
      trackName: trackNameProp || "Arşiv kaydı",
      artworkUrl: artworkUrl || null,
    }))
    window.dispatchEvent(new Event(PLAYBACK_PERSIST_EVENT))
  }, [artworkUrl, persistPlayback, persistenceKind, src, title, trackNameProp])

  /** Çalan parça adı ve kapak: prop verilmişse onu kullan, yoksa trackInfoUrl'den al */
  React.useEffect(() => {
    if (trackNameProp !== undefined) {
      setTrackName(trackNameProp || null)
      if (artworkUrl !== undefined) setArtworkFromApi(null)
      return
    }
    if (!trackInfoUrl || !src) {
      setTrackName(null)
      setArtworkFromApi(null)
      return
    }
    let cancelled = false
    fetch(trackInfoUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return
        if (data?.name) setTrackName(data.name)
        if (data?.artworkUrl) setArtworkFromApi(data.artworkUrl)
        else setArtworkFromApi(null)
      })
      .catch(() => {
        if (!cancelled) {
          setTrackName(null)
          setArtworkFromApi(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [trackNameProp, artworkUrl, trackInfoUrl, src])

  /** Kapak URL'si değişince yükleme hatasını sıfırla */
  const resolvedArtworkUrl = artworkUrl ?? artworkFromApi
  const displayedArtworkUrl = isLive
    ? "/images/lowO-vinyl.png"
    : resolvedArtworkUrl && !artworkLoadFailed
      ? resolvedArtworkUrl
      : null
  React.useEffect(() => {
    setArtworkLoadFailed(false)
  }, [resolvedArtworkUrl])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    setIsMuted(v === 0)
  }

  const handlePersistPlaybackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!persistenceKind) return
    const enabled = e.target.checked
    const otherKind: PlaybackPersistKind = persistenceKind === "live" ? "archive" : "live"
    window.localStorage.setItem(PLAYBACK_PERSIST_KEYS[persistenceKind], String(enabled))
    if (enabled) {
      window.localStorage.setItem(PLAYBACK_PERSIST_KEYS[otherKind], "false")
      window.localStorage.setItem("lowradio-soundcloud-popup-mode", "false")
      const otherAudio = otherKind === "live" ? sharedLiveAudio : sharedArchiveAudio
      otherAudio?.pause()
      window.dispatchEvent(new CustomEvent(EXTERNAL_PLAYBACK_EVENT, { detail: { source: "html-audio" } }))
    }
    setPersistPlayback(enabled)
    window.dispatchEvent(new Event(PLAYBACK_PERSIST_EVENT))
  }

  const hasSource = src && src.length > 0
  const canPlay = hasSource

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLive) return
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  const onSeekPointerDown = () => {
    if (isLive) return
    isSeekingRef.current = true
  }

  const onSeekPointerUp = () => {
    if (isLive) return
    isSeekingRef.current = false
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }

  /** Progress bar: kaynak varken her zaman göster (süre yoksa 0:00 / --:-- ) */
  const showProgressBar = hasSource
  const progressMax = isLive ? 1 : Number.isFinite(duration) && duration > 0 ? duration : 1
  const progressValue = isLive ? 1 : currentTime

  const volumeVisible = volumeOpen

  const sliderTrackClass =
    "h-1 w-full appearance-none rounded-full bg-white/20 accent-white transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"

  const controlIconClass = "h-3.5 w-3.5 shrink-0"
  const controlBtnClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors touch-manipulation hover:bg-white/10 hover:text-white sm:bg-transparent sm:text-white/70"
  const playBtnClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-black transition-colors touch-manipulation disabled:opacity-50 sm:bg-white"

  if (persistenceKind && persistPlayback && !isPersistentPopup) {
    return <label className="player-persist-toggle player-popup-mode-placeholder">
      <input type="checkbox" checked onChange={handlePersistPlaybackChange} />
      <span aria-hidden />
      PLAYER'I POPUP'A AL
    </label>
  }

  return (
    <>
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-[#1a1a1a] min-w-0 w-full",
        "gap-2 px-2.5 py-2.5 sm:gap-0 sm:grid sm:grid-cols-[auto_1fr] sm:items-stretch sm:px-3 sm:py-2.5 md:px-3.5 md:py-3",
        "max-sm:items-center",
        className
      )}
    >
      {!persistenceKind && <audio ref={localAudioRef} preload="none" crossOrigin="anonymous" />}
      {/* Sol: resim alanı – sm+ grid’de sağ sütunla eşit genişlik (1fr) */}
      <div
        className="flex w-full max-w-[4.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-20 sm:max-w-none md:h-24 md:w-24 lg:h-28 lg:w-28 max-sm:aspect-square max-sm:h-auto"
        aria-hidden
      >
        <div
          className={cn(
            "flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-lg",
            displayedArtworkUrl ? "bg-white/5" : "bg-white/[0.06]"
          )}
        >
          {displayedArtworkUrl ? (
            <img
              key={displayedArtworkUrl}
              src={displayedArtworkUrl}
              alt=""
              className="player-track-transition h-full w-full object-cover"
              onError={() => {
                if (displayedArtworkUrl === resolvedArtworkUrl) setArtworkLoadFailed(true)
              }}
            />
          ) : (
            <span className="relative flex items-center justify-center">
              <Music className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white/30" />
            </span>
          )}
        </div>
      </div>
      {/* Sağ: yazı ve tuşlar – mobilde tam genişlik, sm+ soldaki resim yüksekliğiyle aynı */}
      <div className="flex min-w-0 w-full flex-1 flex-col justify-center px-0 sm:min-w-0 sm:w-auto sm:pl-2.5 md:pl-3">
        <div
          className={cn(
            "flex flex-col min-w-0",
            "sm:min-h-20 md:min-h-24 lg:min-h-28 sm:justify-between",
            "gap-1.5 sm:gap-0"
          )}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="mb-0 text-[9px] sm:text-[10px] md:text-xs font-medium tracking-wider text-white/50">
                {title}
              </h3>
            )}
            {trackName && (
              <ScrollingTrackName key={trackName} text={trackName} />
            )}
          </div>
          {showProgressBar && (
            <div className={cn("player-progress-slot w-full min-w-0 shrink-0", error && "player-progress-error")}>
              {isLive ? (
                <LiveWaveform audioRef={audioRef} isPlaying={isPlaying} shared={isLive} />
              ) : (
                <>
                  <input
                    type="range"
                    min={0}
                    max={progressMax}
                    step={0.1}
                    value={progressValue}
                    onChange={handleSeek}
                    onPointerDown={onSeekPointerDown}
                    onPointerUp={onSeekPointerUp}
                    onPointerLeave={onSeekPointerUp}
                    className={cn(sliderTrackClass, "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:min-h-[16px] [&::-webkit-slider-thumb]:min-w-[16px] sm:[&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-2.5")}
                    aria-label="Şarkı ilerlemesi"
                  />
                  <div className="player-progress-times mt-1 flex justify-between text-[10px] sm:text-xs text-white/50">
                    <span>{formatTime(currentTime)}</span>
                    <span>
                      {Number.isFinite(duration) && duration > 0
                        ? formatTime(duration)
                        : "--:--"}
                    </span>
                  </div>
                </>
              )}
              {error && (
                <p className="player-error-message" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
          <div ref={controlsRowRef} className="player-controls-row flex min-w-0 flex-1 flex-row flex-wrap items-center gap-1 sm:gap-1.5">
            <div ref={primaryControlsRef} className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={togglePlay}
                disabled={!canPlay || isLoading}
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
                className={playBtnClass}
              >
                {isLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : isPlaying ? (
                  <PauseGlyph className={controlIconClass} />
                ) : (
                  <PlayGlyph className={cn(controlIconClass, "ml-px")} />
                )}
              </button>
              {onPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Önceki parça"
                  className={cn(controlBtnClass, "disabled:pointer-events-none disabled:opacity-50")}
                >
                  <StepGlyph direction="back" className={controlIconClass} />
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  aria-label="Sonraki parça"
                  className={cn(controlBtnClass, "disabled:pointer-events-none disabled:opacity-50")}
                >
                  <StepGlyph direction="forward" className={controlIconClass} />
                </button>
              )}
            </div>
            <div
              ref={volumeRef}
              className="player-volume-control flex min-w-0 items-center gap-1 sm:gap-1.5"
              data-open={volumeVisible ? "true" : "false"}
              data-layout={volumeLayout}
              onMouseEnter={() => {
                if (!window.matchMedia("(pointer: coarse)").matches) {
                  cancelVolumeClose()
                  setVolumeOpen(true)
                }
              }}
              onMouseLeave={() => {
                if (!window.matchMedia("(pointer: coarse)").matches) {
                  cancelVolumeClose()
                  volumeCloseTimerRef.current = window.setTimeout(() => {
                    setVolumeOpen(false)
                    volumeCloseTimerRef.current = null
                  }, 240)
                }
              }}
            >
              <button
                type="button"
                onPointerDown={handleVolumeButtonPointerDown}
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return
                  setVolumeOpen((o) => !o)
                }}
                aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
                aria-expanded={volumeVisible}
                className={controlBtnClass}
              >
                {isMuted || volume === 0 ? (
                  <SignalGlyph muted className={controlIconClass} />
                ) : (
                  <SignalGlyph className={controlIconClass} />
                )}
              </button>
              <div
                className={cn(
                  "player-volume-panel flex h-7 min-w-0 items-center overflow-hidden rounded-full bg-white/10 px-2 transition-all duration-200",
                  volumeVisible
                    ? "flex-1 opacity-100 px-3"
                    : "w-0 min-w-0 flex-none px-0 opacity-0 pointer-events-none"
                )}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className={cn("w-full min-w-0 max-w-full", sliderTrackClass)}
                  aria-label="Ses düzeyi"
                />
              </div>
            </div>
          </div>
        </div>
        {!hasSource && (
          <p className="mt-0.5 text-[10px] sm:text-xs text-white/50 shrink-0">
            Yayın başlatmak için bir stream URL'si ekleyin.
          </p>
        )}
        </div>
      </div>
      {persistenceKind && !isPersistentPopup && (
        <label className="player-persist-toggle">
          <input
            type="checkbox"
            checked={persistPlayback}
            onChange={handlePersistPlaybackChange}
          />
          <span aria-hidden />
          PLAYER'I POPUP'A AL
        </label>
      )}
    </>
  )
}
