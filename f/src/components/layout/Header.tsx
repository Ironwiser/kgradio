import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Radio, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navLinks = [
  { to: "/canli", label: "Canlı Yayın" },
  { to: "/calma-listeleri", label: "Çalma Listeleri" },
  { to: "/rasgele", label: "Hakkımızda" },
  { to: "/canli", label: "Dinle" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const closeMobile = () => setMobileOpen(false)
  const openDjPanel = () => {
    window.open("https://radio.lforadio.omurgenc.dev", "_blank", "noopener,noreferrer")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#111111] overflow-visible">
      <div className="flex h-[52px] items-center justify-between mx-auto max-w-7xl px-3 sm:px-4 md:px-5 lg:px-6 xl:px-6 2xl:px-8 border-x-0 sm:border-x-[4px] border-border overflow-hidden">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:border-r-[4px] sm:border-border sm:pr-3 md:pr-4 h-full items-center min-w-0 shrink-0"
          onClick={closeMobile}
        >
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center bg-[#d9d9d9]">
            <Radio className="h-3 w-3 sm:h-4 sm:w-4 text-black" aria-hidden />
          </span>
          <span className="font-logo text-lg sm:text-xl md:text-xl lg:text-2xl text-white truncate">
            LfoRadio
          </span>
        </Link>

        {/* Desktop: Nav (lg ve üzeri; dar ekranda hamburger) */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 xl:gap-4 2xl:gap-6 border-r-[4px] border-border pr-3 xl:pr-6 2xl:pr-8 min-w-0 shrink">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "nav-link-glitch font-brutal-heading flex items-center justify-center transition-colors shrink-0",
                  "lg:text-base lg:px-2 lg:py-2 xl:text-lg xl:px-3 xl:py-2.5 2xl:text-xl 2xl:px-4 2xl:py-[10px]",
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                )}
              >
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-0.5 lg:gap-1 shrink-0">
          {user ? (
            <>
              <span className="hidden lg:inline-flex font-brutal-heading items-center px-1.5 py-1 xl:px-2 xl:py-1.5 text-xs xl:text-sm text-white/80 truncate max-w-[120px] xl:max-w-[160px]">
                {user.username}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="hidden lg:inline-flex font-brutal-heading items-center px-1.5 py-1 xl:px-2 xl:py-1.5 text-xs xl:text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link
                to="/giris"
                className="hidden lg:inline-flex font-brutal-heading items-center px-1.5 py-1 xl:px-2 xl:py-1.5 text-xs xl:text-sm text-white/80 hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                to="/kayit"
                className="hidden lg:inline-flex font-brutal-heading items-center px-1.5 py-1 xl:px-2 xl:py-1.5 text-xs xl:text-sm text-[#facc15] hover:text-[#fde047] transition-colors"
              >
                Kayıt Ol
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={openDjPanel}
            className="hidden lg:inline-flex font-brutal-heading items-center px-1.5 py-1 xl:px-2 xl:py-1.5 text-xs xl:text-sm text-[#facc15] hover:text-[#fde047] transition-colors"
          >
            DJ Girişi
          </button>

          {/* Hamburger: lg altında göster */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-white lg:hidden touch-manipulation"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü: overlay (içeriği itmez), lg altında, transparan arka plan */}
      <div
        className={cn(
          "lg:hidden absolute left-0 right-0 top-full border-t-2 border-border backdrop-blur-sm transition-[max-height] duration-200 ease-out",
          mobileOpen ? "max-h-[85vh] overflow-y-auto" : "max-h-0 overflow-hidden"
        )}
        style={{ background: "rgba(17, 17, 17, 0.95)" }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col px-4 py-4 gap-2 pb-6">
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

          {/* Sağ tuş takımı – menünün en altında: üstte kullanıcı adı, altta çıkış; sola hizalı */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 items-start">
            {user ? (
              <>
                <span className="font-brutal-heading py-[10px] px-3 text-lg text-white/80">
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile()
                    openDjPanel()
                  }}
                  className="font-brutal-heading inline-flex items-center py-[10px] px-3 text-lg text-[#facc15] hover:text-[#fde047] transition-colors touch-manipulation text-left"
                >
                  DJ Girişi
                </button>
                <button
                  type="button"
                  onClick={() => { closeMobile(); logout() }}
                  className="font-brutal-heading inline-flex items-center py-[10px] px-3 text-lg text-red-400 hover:text-red-300 touch-manipulation text-left"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  onClick={closeMobile}
                  className="font-brutal-heading inline-flex items-center py-[10px] px-3 text-lg text-white/80 hover:text-white touch-manipulation text-left"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  onClick={closeMobile}
                  className="font-brutal-heading inline-flex items-center py-[10px] px-3 text-lg text-[#facc15] hover:text-[#fde047] touch-manipulation text-left"
                >
                  Kayıt Ol
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile()
                    openDjPanel()
                  }}
                  className="font-brutal-heading inline-flex items-center py-[10px] px-3 text-lg text-[#facc15] hover:text-[#fde047] transition-colors touch-manipulation text-left"
                >
                  DJ Girişi
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
