import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const heroConfig = {
  titleHighlight: "Canlı",
  titleRest: "playlist'inden dinleyin.",
  subtitle:
    "Kerem Genç'in özenle seçtiği şarkılar, kesintisiz müzik. Hemen dinlemeye başlayın.",
  ctaPrimary: { label: "Dinlemeye Başla", href: "/calma-listeleri" },
  ctaSecondary: { label: "Rasgele Keşfet", href: "/rasgele" },
}

export function Hero() {
  return (
    <section
      className={cn(
        "relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20",
        "bg-gradient-to-r from-blue-600 via-blue-500/90 to-cyan-500"
      )}
    >
      <div className="container relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
          <span className="inline-block rounded bg-blue-900/90 px-2 py-1 shadow-md ring-1 ring-white/20">
            {heroConfig.titleHighlight}
          </span>{" "}
          {heroConfig.titleRest}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/95 md:text-xl">
          {heroConfig.subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-blue-500 text-white shadow-lg shadow-blue-500/40 ring-2 ring-white/40 hover:bg-blue-400 hover:ring-white/50 hover:shadow-blue-400/50"
          >
            <Link to={heroConfig.ctaPrimary.href}>
              {heroConfig.ctaPrimary.label}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to={heroConfig.ctaSecondary.href}>
              {heroConfig.ctaSecondary.label}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
