import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const heroConfig = {
  title: "LfoRadio",
  subtitle: "No Algorithms · Pure Transmission",
  ctaPrimary: { label: "Dinlemeye Başla", href: "/calma-listeleri" },
  ctaSecondary: { label: "Hakkımızda", href: "/rasgele" },
}

const heroCtaBase =
  "hero-cta-glitch font-brutal-heading inline-flex box-border items-center justify-center min-h-11 sm:h-[52px] px-4 sm:px-6 py-2.5 sm:py-[12px] text-base sm:text-xl md:text-2xl font-semibold text-black touch-manipulation max-w-[240px] sm:max-w-none rounded-none text-center leading-tight sm:whitespace-nowrap"

const heroCtaClass = heroCtaBase

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
      className="relative z-0 flex min-h-0 w-full min-w-0 flex-1 items-center overflow-hidden box-border"
      aria-label="Ana içerik"
    >
      {/* Arka plan videoları – sırayla oynar */}
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

      <div className="relative z-10 w-full min-w-0 px-3 pb-4 pt-2 sm:px-4 sm:pb-6 md:px-6 box-border">
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
            <Link to={heroConfig.ctaPrimary.href} className={heroCtaClass}>
              <span>{heroConfig.ctaPrimary.label}</span>
            </Link>
            <Link to={heroConfig.ctaSecondary.href} className={heroCtaClass}>
              <span>{heroConfig.ctaSecondary.label}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}