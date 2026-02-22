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
    "h-1.5 w-full appearance-none rounded-full bg-white/20 accent-white transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-[#1a1a1a] min-w-0 w-full",
        "gap-3 px-3 py-4 sm:gap-0 sm:grid sm:grid-cols-[auto_1fr] sm:items-stretch sm:pl-3 sm:pr-4 sm:py-4 md:pl-4 md:pr-5 md:py-5 lg:pl-5 lg:pr-6 lg:py-5 xl:pl-5 xl:pr-6 xl:py-6",
        "max-sm:items-center",
        className
      )}
    >
      <audio ref={audioRef} preload="none" />
      {/* Sol: resim alanı – sm+ grid’de sağ sütunla eşit genişlik (1fr) */}
      <div
        className="flex w-full shrink-0 items-center justify-center pb-0 sm:h-32 sm:w-32 sm:pb-0 md:h-36 md:w-36 lg:h-40 lg:w-40 xl:h-44 xl:w-44 max-sm:aspect-square max-sm:h-auto"
        aria-hidden
      >
        <div
          className={cn(
            "flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-xl md:rounded-2xl",
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
              <Music className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/30" />
            </span>
          )}
        </div>
      </div>
      {/* Sağ: yazı ve tuşlar – mobilde tam genişlik, sm+ soldaki resim yüksekliğiyle aynı */}
      <div className="flex min-w-0 w-full flex-1 flex-col justify-center px-0 sm:min-w-0 sm:w-auto sm:pl-3 md:pl-4 lg:pl-5">
        <div
          className={cn(
            "flex flex-col min-w-0",
            "sm:min-h-32 md:min-h-36 lg:min-h-40 xl:min-h-44 sm:justify-between",
            "gap-2 sm:gap-0"
          )}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="mb-0.5 sm:mb-0 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider text-white/50">
                {title}
              </h3>
            )}
            {trackName && (
              <p
                className="truncate text-base font-semibold text-white sm:text-lg md:text-xl lg:text-2xl"
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
              className={cn(sliderTrackClass, "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:min-h-[20px] [&::-webkit-slider-thumb]:min-w-[20px] sm:[&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-3.5")}
              aria-label="Şarkı ilerlemesi"
            />
            <div className="mt-1.5 sm:mt-2 flex justify-between text-xs sm:text-sm text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>
                {Number.isFinite(duration) && duration > 0
                  ? formatTime(duration)
                  : "--:--"}
              </span>
            </div>
          </div>
        )}
          <div
            ref={volumeRef}
            className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-1 sm:gap-2"
            onMouseEnter={() => {
              if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(true)
            }}
            onMouseLeave={() => {
              if (!window.matchMedia("(pointer: coarse)").matches) setVolumeOpen(false)
            }}
          >
          {/* Tuşlar tek sıra; volume bar yanda sığarsa yanda, sığmazsa alta sarar */}
          <div
            className={cn(
              "grid w-full min-w-0 max-w-[11rem] shrink-0 gap-1 sm:max-w-[13rem] sm:gap-2 md:gap-3",
              onPrevious && onNext ? "grid-cols-4" : onPrevious || onNext ? "grid-cols-3" : "grid-cols-2"
            )}
            style={{
              aspectRatio: onPrevious && onNext ? "4/1" : onPrevious || onNext ? "3/1" : "2/1",
              gridAutoRows: "1fr",
            }}
          >
            <div className="flex min-w-0 items-center justify-center [min-width:0]">
              <button
                type="button"
                onClick={togglePlay}
                disabled={!canPlay || isLoading}
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
                className={cn(
                  "flex aspect-square w-full min-w-0 items-center justify-center rounded-full transition-transform touch-manipulation",
                  "bg-white/95 text-black sm:bg-white",
                  "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                {isLoading ? (
                  <span className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0 ml-0" />
                ) : (
                  <Play className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0 ml-0.5" />
                )}
              </button>
            </div>
            {onPrevious && (
              <div className="flex min-w-0 items-center justify-center">
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Önceki parça"
                  className="flex aspect-square w-full min-w-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors transition-transform touch-manipulation hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:bg-transparent sm:text-white/70"
                >
                  <SkipBack className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0" />
                </button>
              </div>
            )}
            {onNext && (
              <div className="flex min-w-0 items-center justify-center">
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  aria-label="Sonraki parça"
                  className="flex aspect-square w-full min-w-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors transition-transform touch-manipulation hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:bg-transparent sm:text-white/70"
                >
                  <SkipForward className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0" />
                </button>
              </div>
            )}
            <div className="flex min-w-0 items-center justify-center">
              <button
                type="button"
                onPointerDown={handleVolumeButtonPointerDown}
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return
                  setVolumeOpen((o) => !o)
                }}
                aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
                aria-expanded={volumeVisible}
                className="flex aspect-square w-full min-w-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors transition-transform touch-manipulation hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-95 sm:bg-transparent sm:text-white/70"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0" />
                ) : (
                  <Volume2 className="h-[55%] w-[55%] min-h-[12px] min-w-[12px] max-h-5 max-w-5 shrink-0" />
                )}
              </button>
            </div>
          </div>
          {/* Ses kaydı: yanda sığarsa yanda, sığmazsa (min 8rem) alta sarar */}
          <div
            className={cn(
              "flex h-9 shrink-0 items-center overflow-hidden rounded-full bg-white/10 px-3 transition-all duration-200",
              volumeVisible
                ? "min-w-[8rem] shrink-0 flex-1 opacity-100 px-4"
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
        {error && (
          <p className="mt-2 text-xs sm:text-sm text-red-400 shrink-0" role="alert">
            {error}
          </p>
        )}
        {!hasSource && (
          <p className="mt-1 text-xs sm:text-sm text-white/50 shrink-0">
            Yayın başlatmak için bir stream URL'si ekleyin.
          </p>
        )}
        </div>
      </div>
  )
}
