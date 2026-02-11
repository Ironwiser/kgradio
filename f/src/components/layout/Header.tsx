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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#111111] overflow-hidden">
      <div className="flex h-[52px] items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 border-x-0 sm:border-x-[4px] border-border overflow-hidden">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 pr-2 sm:border-r-[4px] sm:border-border sm:pr-4 h-full items-center min-w-0 shrink-0"
          onClick={closeMobile}
        >
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center bg-[#d9d9d9]">
            <Radio className="h-3 w-3 sm:h-4 sm:w-4 text-black" aria-hidden />
          </span>
          <span className="font-logo text-xl sm:text-2xl text-white truncate">
            LfoRadio
          </span>
        </Link>

        {/* Desktop: Nav + CTA */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-6 border-r-[4px] border-border pr-6 lg:pr-8 min-w-0">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "nav-link-glitch font-brutal-heading text-xl px-4 py-[10px] flex items-center justify-center transition-colors",
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                )}
              >
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <Link
            to="/canli"
            className="nav-link-glitch hidden md:inline-flex font-brutal-heading items-center px-5 py-[10px] text-xl text-white hover:text-white/80 transition-colors"
          >
            <span>Dinle</span>
          </Link>

          <button
            type="button"
            onClick={openDjPanel}
            className="hidden md:inline-flex font-brutal-heading items-center px-4 py-[10px] text-base text-[#facc15] hover:text-[#fde047] transition-colors"
          >
            DJ Girişi
          </button>

          {/* Mobile: Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-white md:hidden touch-manipulation"
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
          mobileOpen ? "max-h-[240px]" : "max-h-0"
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
                "nav-link-glitch font-brutal-heading py-[10px] px-3 text-xl capitalize transition-colors touch-manipulation",
                location.pathname === to ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/canli"
            onClick={closeMobile}
            className="nav-link-glitch font-brutal-heading mt-2 inline-flex items-center justify-center py-[10px] px-4 text-xl text-white hover:text-white/80 transition-colors touch-manipulation"
          >
            <span>Dinle</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              closeMobile()
              openDjPanel()
            }}
            className="font-brutal-heading mt-2 inline-flex items-center justify-center py-[10px] px-4 text-xl text-[#facc15] hover:text-[#fde047] transition-colors touch-manipulation"
          >
            DJ Girişi
          </button>
        </nav>
      </div>
    </header>
  )
}
