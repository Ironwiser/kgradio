import { Link } from "react-router-dom"

const heroConfig = {
  title: "LfoRadio",
  subtitle: "No Algorithms · Pure Transmission",
  ctaPrimary: { label: "Dinlemeye Başla", href: "/calma-listeleri" },
  ctaSecondary: { label: "Hakkımızda", href: "/rasgele" },
}

export function Hero() {
  return (
    <section
      className="relative z-0 flex items-center border-b border-x border-border bg-[#111111] min-h-[calc(100vh-6rem)]"
      aria-label="Ana içerik"
    >
      <div className="w-full px-4 sm:px-6 -translate-y-4 sm:-translate-y-10">
        {/* Ortadaki blok – sade logo + slogan */}
        <div className="mx-auto w-full max-w-3xl text-center">
          <h1 className="font-logo text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white">
            {heroConfig.title}
          </h1>
          <p className="mt-5 sm:mt-6 text-lg sm:text-2xl md:text-3xl text-neutral-400">
            {heroConfig.subtitle}
          </p>
          {/* CTA blokları – büyük font + geniş şeritler */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={heroConfig.ctaPrimary.href}
              className="font-brutal-heading inline-flex items-center justify-center min-h-[56px] px-8 py-3 text-2xl tracking-wide text-black bg-white hover:bg-neutral-200 transition-colors touch-manipulation"
            >
              {heroConfig.ctaPrimary.label}
            </Link>
            <Link
              to={heroConfig.ctaSecondary.href}
              className="font-brutal-heading inline-flex items-center justify-center min-h-[56px] px-8 py-3 text-2xl tracking-wide text-black bg-[#777777] hover:bg-white transition-colors touch-manipulation"
            >
              {heroConfig.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}