"use client"

import * as React from "react"
import { Play, Pause, Volume2, VolumeX, Music, SkipBack, SkipForward } from "lucide-react"
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

export function Player({ src, title, trackName: trackNameProp, artworkUrl, trackInfoUrl, autoPlay, onPrevious, onNext, canGoPrevious = true, canGoNext = true, className }: PlayerProps) {
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

    const onPlay = () => {
      setIsPlaying(true)
      setError(null)
    }
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
      audio.play().catch((e: unknown) => {
        const name = (e as { name?: string })?.name
        if (name !== "NotAllowedError") setError("Çalınamadı.")
      }).finally(() => setIsLoading(false))
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
    "h-1 w-full appearance-none rounded-full bg-white/20 accent-white transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"

  const controlIconClass = "h-3.5 w-3.5 shrink-0"
  const controlBtnClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors touch-manipulation hover:bg-white/10 hover:text-white active:scale-95 sm:bg-transparent sm:text-white/70"
  const playBtnClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-black transition-transform touch-manipulation hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 sm:bg-white"

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-[#1a1a1a] min-w-0 w-full",
        "gap-2 px-2.5 py-2.5 sm:gap-0 sm:grid sm:grid-cols-[auto_1fr] sm:items-stretch sm:px-3 sm:py-2.5 md:px-3.5 md:py-3",
        "max-sm:items-center",
        className
      )}
    >
      <audio ref={audioRef} preload="none" />
      {/* Sol: resim alanı – sm+ grid’de sağ sütunla eşit genişlik (1fr) */}
      <div
        className="flex w-full max-w-[4.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-20 sm:max-w-none md:h-24 md:w-24 lg:h-28 lg:w-28 max-sm:aspect-square max-sm:h-auto"
        aria-hidden
      >
        <div
          className={cn(
            "flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-lg",
            resolvedArtworkUrl && !artworkLoadFailed ? "bg-white/5" : "bg-white/[0.06]"
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
              <h3 className="mb-0 text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-white/50">
                {title}
              </h3>
            )}
            {trackName && (
              <p
                className="truncate text-sm font-semibold text-white sm:text-base md:text-lg"
                title={trackName}
              >
                {trackName}
              </p>
            )}
          </div>
          {showProgressBar && (
            <div className="w-full min-w-0 shrink-0">
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
              className={cn(sliderTrackClass, "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:min-h-[16px] [&::-webkit-slider-thumb]:min-w-[16px] sm:[&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-2.5")}
              aria-label="Şarkı ilerlemesi"
            />
            <div className="mt-1 flex justify-between text-[10px] sm:text-xs text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>
                {Number.isFinite(duration) && duration > 0
                  ? formatTime(duration)
                  : "--:--"}
              </span>
            </div>
          </div>
        )}
          <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-1 sm:gap-1.5">
            <div className="flex shrink-0 items-center gap-1.5">
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
                  <Pause className={controlIconClass} />
                ) : (
                  <Play className={cn(controlIconClass, "ml-px")} />
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
                  <SkipBack className={controlIconClass} />
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
                  <SkipForward className={controlIconClass} />
                </button>
              )}
            </div>
            <div
              ref={volumeRef}
              className="flex min-w-0 items-center gap-1 sm:gap-1.5"
              onMouseEnter={() => {
                if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(true)
              }}
              onMouseLeave={() => {
                if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(false)
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
                  <VolumeX className={controlIconClass} />
                ) : (
                  <Volume2 className={controlIconClass} />
                )}
              </button>
              <div
                className={cn(
                  "flex h-7 shrink-0 items-center overflow-hidden rounded-full bg-white/10 px-2 transition-all duration-200",
                  volumeVisible
                    ? "min-w-[6.5rem] shrink-0 flex-1 opacity-100 px-3"
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
        {error && (
          <p className="mt-1 text-[10px] sm:text-xs text-red-400 shrink-0" role="alert">
            {error}
          </p>
        )}
        {!hasSource && (
          <p className="mt-0.5 text-[10px] sm:text-xs text-white/50 shrink-0">
            Yayın başlatmak için bir stream URL'si ekleyin.
          </p>
        )}
        </div>
      </div>
  )
}
