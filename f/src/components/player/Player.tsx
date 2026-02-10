"use client"

import * as React from "react"
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  className?: string
}

export function Player({ src, title, trackName: trackNameProp, artworkUrl, trackInfoUrl, autoPlay, className }: PlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
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
  const volumeRef = React.useRef<HTMLDivElement>(null)
  const isSeekingRef = React.useRef(false)
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
    } else {
      setError(null)
      setIsLoading(true)
      audio.play().catch(() => {
        setError("Çalınamadı. Stream URL'sini kontrol edin.")
        setIsPlaying(false)
      }).finally(() => setIsLoading(false))
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onError = () => {
      setError("Yayın yüklenemedi.")
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
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("durationchange", onDurationChange)
    }
  }, [])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || src === undefined) return
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    audio.src = src
    const shouldPlay = autoPlay || isPlaying
    if (shouldPlay) {
      setIsLoading(true)
      audio.play().catch(() => setError("Çalınamadı.")).finally(() => setIsLoading(false))
    }
  }, [src, autoPlay])

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
  React.useEffect(() => {
    setArtworkLoadFailed(false)
  }, [resolvedArtworkUrl])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    setIsMuted(v === 0)
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
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  const onSeekPointerDown = () => {
    isSeekingRef.current = true
  }

  const onSeekPointerUp = () => {
    isSeekingRef.current = false
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }

  /** Progress bar: kaynak varken her zaman göster (süre yoksa 0:00 / --:-- ) */
  const showProgressBar = hasSource
  const progressMax = Number.isFinite(duration) && duration > 0 ? duration : 1

  const volumeVisible = volumeOpen

  const sliderTrackClass =
    "h-1.5 w-full appearance-none rounded-full bg-muted/80 accent-primary transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border border-border/40 bg-card",
        className
      )}
    >
      <audio ref={audioRef} preload="none" />
      {/* Sol: parça/albüm görseli — player ile aynı boşluk (p-4 sm:p-5) */}
      <div className="flex shrink-0 items-center justify-center p-4 pt-4 sm:p-5 sm:pt-5" aria-hidden>
        <div
          className={cn(
            "flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-40 sm:w-40",
            resolvedArtworkUrl && !artworkLoadFailed ? "bg-muted" : "bg-[#111111]"
          )}
        >
          {resolvedArtworkUrl && !artworkLoadFailed ? (
            <img
              src={resolvedArtworkUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setArtworkLoadFailed(true)}
            />
          ) : (
            <span className="relative flex items-center justify-center">
              {/* Dekoratif halka */}
              <span
                className="absolute h-20 w-20 rounded-full border-2 border-white/10 sm:h-24 sm:w-24"
                aria-hidden
              />
              <span
                className="absolute h-28 w-28 rounded-full border border-white/5 sm:h-32 sm:w-32"
                aria-hidden
              />
              <Music className="relative h-12 w-12 text-white/40 drop-shadow sm:h-14 sm:w-14" />
            </span>
          )}
        </div>
      </div>
      {/* Sağ: başlık, progress, kontroller */}
      <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
        {title && (
          <h3 className="mb-2 text-base font-medium capitalize tracking-wider text-muted-foreground">
            {title}
          </h3>
        )}
        {trackName && (
          <p
            className="mb-4 truncate text-2xl font-semibold text-foreground"
            title={trackName}
          >
            {trackName}
          </p>
        )}
        {showProgressBar && (
          <div className="mb-4 w-full">
            <input
              type="range"
              min={0}
              max={progressMax}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              onPointerDown={onSeekPointerDown}
              onPointerUp={onSeekPointerUp}
              onPointerLeave={onSeekPointerUp}
              className={cn(sliderTrackClass, "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4")}
              aria-label="Şarkı ilerlemesi"
            />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>
                {Number.isFinite(duration) && duration > 0
                  ? formatTime(duration)
                  : "--:--"}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-5">
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 shrink-0 rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
            onClick={togglePlay}
            disabled={!canPlay || isLoading}
            aria-label={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <div
            ref={volumeRef}
            className="flex flex-wrap items-center gap-2 min-w-0 flex-1"
            onMouseEnter={() => {
              if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(true)
            }}
            onMouseLeave={() => {
              if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(false)
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full touch-manipulation"
              onPointerDown={handleVolumeButtonPointerDown}
              onClick={() => {
                if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return
                setVolumeOpen((o) => !o)
              }}
              aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
              aria-expanded={volumeVisible}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            {/* Mobilde ses kaydırıcısı tam genişlikte alt satıra iner; masaüstünde satır içi */}
            <div
              className={cn(
                "flex h-9 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-popover px-3 shadow-xl transition-all duration-200",
                volumeVisible
                  ? "w-full min-w-0 basis-full opacity-100 sm:basis-auto sm:w-40 sm:min-w-[10rem] sm:px-4"
                  : "w-0 min-w-0 basis-0 border-0 bg-transparent px-0 opacity-0 pointer-events-none"
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
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {!hasSource && (
          <p className="mt-2 text-sm text-muted-foreground">
            Yayın başlatmak için bir stream URL'si ekleyin.
          </p>
        )}
      </div>
    </div>
  )
}
