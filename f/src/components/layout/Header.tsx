import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Radio, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { to: "/canli", label: "Canlı Yayın" },
  { to: "/calma-listeleri", label: "Çalma Listeleri" },
  { to: "/rasgele", label: "Hakkımızda" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const closeMobile = () => setMobileOpen(false)
  const openDjPanel = () => {
    window.open("https://radio.lforadio.omurgenc.dev", "_blank", "noopener,noreferrer")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#111111]">
      <div className="flex h-14 sm:h-16 items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 border-x-0 sm:border-x-[3px] border-border">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 pr-2 sm:border-r-[3px] sm:border-border sm:pr-4 h-full items-center min-w-0"
          onClick={closeMobile}
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center border border-border bg-[#d9d9d9]">
            <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-black" aria-hidden />
          </span>
          <span className="font-logo text-2xl sm:text-3xl tracking-tight text-white truncate">
            LfoRadio
          </span>
        </Link>

        {/* Desktop: Nav + CTA */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-6 border-r-[3px] border-border pr-6 lg:pr-8">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "font-brutal-heading text-2xl tracking-wide px-6 py-2 min-h-[52px] flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-white text-black"
                    : "bg-[#777777] text-black hover:bg-white"
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <Link
            to="/canli"
            className="hidden md:inline-flex font-brutal-heading items-center px-6 py-2 sm:px-7 sm:py-2.5 text-2xl tracking-wide text-black bg-white hover:bg-neutral-200 transition-colors"
          >
            Dinle
          </Link>

          <button
            type="button"
            onClick={openDjPanel}
            className="hidden md:inline-flex font-brutal-heading items-center px-4 py-2 sm:px-5 sm:py-2.5 text-xl tracking-wide text-black bg-[#facc15] hover:bg-[#fde047] transition-colors"
          >
            DJ Girişi
          </button>

          {/* Mobile: Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-2 border-white text-white md:hidden touch-manipulation"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t-2 border-border bg-[#111111] transition-[max-height] duration-200 ease-out",
          mobileOpen ? "max-h-[280px]" : "max-h-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col px-4 py-4 gap-2">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeMobile}
              className={cn(
                "font-brutal-heading py-4 px-3 text-2xl capitalize tracking-wide border-b border-white/20 last:border-0 transition-colors touch-manipulation",
                location.pathname === to ? "text-[#2563eb]" : "text-white hover:text-[#2563eb] hover:bg-white/5 active:bg-white/10"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/canli"
            onClick={closeMobile}
            className="font-brutal-heading mt-3 inline-flex items-center justify-center py-4 px-5 text-2xl tracking-wide text-black bg-white hover:bg-neutral-200 transition-colors touch-manipulation"
          >
            Dinle
          </Link>
          <button
            type="button"
            onClick={() => {
              closeMobile()
              openDjPanel()
            }}
            className="font-brutal-heading mt-2 inline-flex items-center justify-center py-4 px-5 text-2xl tracking-wide text-black bg-[#facc15] hover:bg-[#fde047] transition-colors touch-manipulation"
          >
            DJ Girişi
          </button>
        </nav>
      </div>
    </header>
  )
}
