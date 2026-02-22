import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const heroConfig = {
  title: "LfoRadio",
  subtitle: "No Algorithms · Pure Transmission",
  ctaPrimary: { label: "Dinlemeye Başla", href: "/calma-listeleri" },
  ctaSecondary: { label: "Hakkımızda", href: "/rasgele" },
}

const FALLBACK_VIDEO = "WhatsApp Video 2026-02-07 at 03.07.32.mp4"

export function Hero() {
  const [videoList, setVideoList] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
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
    if (videoList.length === 0 || !videoRef.current) return
    const name = videoList[currentIndex % videoList.length]
    const src = "/animasyon/" + encodeURIComponent(name)
    videoRef.current.src = src
    videoRef.current.play().catch(() => {})
  }, [videoList, currentIndex])

  const goNext = () => {
    setCurrentIndex((i) => (videoList.length ? (i + 1) % videoList.length : 0))
  }

  return (
    <section
      className="relative z-0 flex items-center box-border min-h-[calc(100vh-54px)] h-[calc(100vh-54px)] max-h-[calc(100vh-54px)] overflow-hidden w-full min-w-0"
      aria-label="Ana içerik"
    >
      {/* Arka plan videoları – sırayla oynar */}
      <div className="absolute inset-0 z-0 min-h-full">
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
          onEnded={goNext}
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
      </div>

      <div className="relative z-10 w-full min-w-0 px-3 sm:px-4 md:px-6 -translate-y-4 sm:-translate-y-10 box-border">
        {/* Ortadaki blok – sade logo + slogan */}
        <div className="mx-auto w-full max-w-3xl min-w-0 text-center">
          <h1 className="font-logo text-5xl sm:text-6xl lg:text-7xl font-medium text-white">
            {heroConfig.title}
          </h1>
          <p className="mt-5 sm:mt-6 text-lg sm:text-2xl md:text-3xl font-medium text-neutral-400">
            {heroConfig.subtitle}
          </p>
          {/* CTA – masaüstünde elegant, mobilde dar/kompakt (max genişlik + gerekirse 2 satır) */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center max-w-full">
            <Link
              to={heroConfig.ctaPrimary.href}
              className="font-brutal-heading inline-flex items-center justify-center min-h-11 sm:h-[52px] px-4 sm:px-6 py-2.5 sm:py-[12px] text-base sm:text-xl md:text-2xl font-semibold text-black bg-white hover:bg-neutral-200 transition-colors touch-manipulation max-w-[240px] sm:max-w-none rounded-none text-center leading-tight sm:whitespace-nowrap"
            >
              {heroConfig.ctaPrimary.label}
            </Link>
            <Link
              to={heroConfig.ctaSecondary.href}
              className="font-brutal-heading inline-flex items-center justify-center min-h-11 sm:h-[52px] px-4 sm:px-6 py-2.5 sm:py-[12px] text-base sm:text-xl md:text-2xl font-semibold text-black bg-[#777777] hover:bg-white transition-colors touch-manipulation max-w-[240px] sm:max-w-none rounded-none text-center leading-tight sm:whitespace-nowrap"
            >
              {heroConfig.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}