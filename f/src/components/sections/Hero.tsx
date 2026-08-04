import { useEffect, useRef, useState } from "react"
import { Player } from "@/components/player/Player"

const heroConfig = {
  subtitle: "No Algorithms · Pure Transmission",
}

const FALLBACK_VIDEO = "WhatsApp Video 2026-02-07 at 03.07.32.mp4"
const HERO_BACKGROUND_VIDEO_ENABLED = false
const LIVE_STREAM_URL =
  "https://radio.lforadio.omurgenc.dev/listen/lfo_radio/radio.mp3"

export function Hero() {
  const [videoList, setVideoList] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!HERO_BACKGROUND_VIDEO_ENABLED) return

    fetch("/api/animasyon/list")
      .then((r) => r.json())
      .then((data: { files?: string[] }) => {
        const files = data.files?.length ? data.files : [FALLBACK_VIDEO]
        setVideoList(files)
        setCurrentIndex(0)
      })
      .catch(() => setVideoList([FALLBACK_VIDEO]))
  }, [])

  useEffect(() => {
    if (!HERO_BACKGROUND_VIDEO_ENABLED) return

    if (videoList.length === 0 || !videoRef.current) return
    const name = videoList[currentIndex % videoList.length]
    const src = "/animasyon/" + encodeURIComponent(name)
    const video = videoRef.current
    video.src = src
    video.load()
    // iOS Safari: otomatik oynatma yalnızca muted + playsInline ile çalışır; hata sayfayı kilitlemez
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {})
    }
  }, [videoList, currentIndex])

  const goNext = () => {
    setCurrentIndex((i) => (videoList.length ? (i + 1) % videoList.length : 0))
  }

  return (
    <section
      className="lfo-hero"
      aria-label="Ana içerik"
    >
      {/* Arka plan videoları – sırayla oynar */}
      {HERO_BACKGROUND_VIDEO_ENABLED && (
        <div className="absolute inset-0 z-0 min-h-full">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
            onEnded={goNext}
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
        </div>
      )}

      <div className="lfo-hero-content">
        <div className="lfo-hero-meta">
          <p className="lfo-hero-description">
            Bağımsız sesleri, seçkileri ve canlı yayınları algoritmalardan uzak,
            özgür bir frekansta bir araya getiriyoruz.
          </p>
          <p className="lfo-hero-status">Dünya çapında<br />7/24 yayında</p>
        </div>

        <div className="lfo-hero-monogram" aria-hidden="true">LOW</div>

        <div className="lfo-hero-bottom">
          <div>
            <Player
              src={LIVE_STREAM_URL}
              title="LowRadio Canlı"
              className="lfo-home-player"
            />
            <p className="lfo-hero-kicker">{heroConfig.subtitle}</p>
            <h1>Sesin peşindeyiz.<br />Frekansımız herkese açık.</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
