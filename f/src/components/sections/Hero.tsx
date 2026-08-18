import { useEffect, useRef, useState } from "react"
import { Player } from "@/components/player/Player"

const heroConfig = {
  subtitle: "NO ALGORITHMS · PURE TRANSMISSION",
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

      <div className="low-home-v2-shell">
        <div className="low-home-v2-topline">
          <p>INDEPENDENT RADIO</p>
          <p><span aria-hidden /> WORLDWIDE · 24/7</p>
        </div>

        <div className="low-home-v2-mobile-content">
          <div className="low-home-v2-stage">
            <div className="low-home-v2-broadcast">
              <p className="low-home-v2-section-label">LIVE TRANSMISSION</p>
              <Player
                src={LIVE_STREAM_URL}
                title="LOWRadio Canlı"
                className="low-home-v2-player"
              />
              <div className="low-home-v2-copy">
                <p>Bağımsız sesleri, seçkileri ve canlı yayınları algoritmalardan uzak bir araya getiriyoruz.</p>
                <p>{heroConfig.subtitle}</p>
              </div>
            </div>

            <div className="low-home-v2-mark" aria-label="LOWRadio">
              <strong aria-hidden>LOW</strong>
              <div className="low-home-v2-mark-lockup">
                <img className="low-home-v2-mark-logo" src="/images/low-logo.png" alt="LOWRadio" />
                <span aria-hidden>Radio</span>
              </div>
            </div>
          </div>

          <div className="low-home-v2-manifesto">
            <p>OPEN FREQUENCY / CURATED SOUND</p>
            <h1>
              <span>Sesin peşindeyiz.</span>
              <span>Frekansımız herkese açık.</span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
