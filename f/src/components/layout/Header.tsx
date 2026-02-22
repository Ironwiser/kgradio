import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Radio, Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navLinks = [
  { to: "/canli", label: "Canlı Yayın" },
  { to: "/calma-listeleri", label: "Çalma Listeleri" },
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/canli", label: "Dinle" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false)
  const rightDropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user, logout } = useAuth()

  const closeMobile = () => setMobileOpen(false)
  const closeRightDropdown = () => setRightDropdownOpen(false)

  useEffect(() => {
    if (!rightDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (rightDropdownRef.current && !rightDropdownRef.current.contains(e.target as Node)) {
        setRightDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [rightDropdownOpen])

  const openDjPanel = () => {
    window.open("https://radio.lforadio.omurgenc.dev", "_blank", "noopener,noreferrer")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#111111] overflow-visible">
      <div className="w-full px-4">
        <div className="flex h-[52px] items-center justify-between mx-auto max-w-3xl min-w-0 overflow-visible">
        {/* Sol alan – marka; lg’de sağ ile aynı genişlik (w-44) */}
        <Link
          to="/"
          className="logo-link-glitch flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 md:pr-4 h-full shrink-0 min-w-0"
          onClick={closeMobile}
        >
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center bg-[#d9d9d9]">
            <Radio className="h-3 w-3 sm:h-4 sm:w-4 text-black" aria-hidden />
          </span>
          <span className="font-logo text-lg sm:text-xl md:text-xl lg:text-2xl text-white truncate">
            LfoRadio
          </span>
        </Link>

        <nav className="hidden lg:flex h-full flex-1 items-center justify-center gap-2 xl:gap-4 min-w-0">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to)
            const effectNarrow = ["Canlı Yayın", "Hakkımızda", "Dinle"].includes(label)
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  "nav-link-glitch font-brutal-heading flex h-full min-h-0 items-center justify-center transition-colors shrink-0",
                  "lg:text-base lg:px-2 xl:text-lg xl:px-3 2xl:text-xl 2xl:px-4",
                  effectNarrow && "nav-link-effect-narrow",
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                )}
              >
                <span className="nav-eq-bars" aria-hidden>
                  {[30, 33, 37, 40, 44, 47, 51, 54, 58, 61, 65, 68, 72, 75, 79, 82, 86, 89, 100, 89, 86, 82, 79, 75, 72, 68, 65, 61, 58, 54, 51, 47, 44, 40, 37, 33].map((h, i) => (
                    <span key={i} className="nav-eq-bar" style={{ ["--eq-h" as string]: String(h) }} />
                  ))}
                </span>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="relative flex items-center gap-0.5 lg:gap-1 shrink-0" ref={rightDropdownRef}>
          {/* Masaüstü: aşağı açılan menü tetikleyicisi */}
          <button
            type="button"
            onClick={() => setRightDropdownOpen((o) => !o)}
            className="hidden lg:inline-flex font-brutal-heading items-center justify-center gap-1 px-2 py-1.5 xl:px-3 xl:py-2 2xl:px-4 text-xs xl:text-sm text-white/90 hover:text-white transition-colors"
            aria-expanded={rightDropdownOpen}
            aria-haspopup="true"
          >
            {user ? user.username : "Giriş"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", rightDropdownOpen && "rotate-180")} />
          </button>

          {/* Aşağı açılan menü – Çıkış, DJ Girişi / Giriş Yap, Kayıt Ol, DJ Girişi */}
          {rightDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] bg-[#111111] py-1 shadow-lg">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs xl:text-sm text-white/70 font-brutal-heading">
                    {user.username}
                  </div>
                  <button
                    type="button"
                    onClick={() => { closeRightDropdown(); logout() }}
                    className="font-brutal-heading w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/giris"
                    onClick={closeRightDropdown}
                    className="font-brutal-heading block w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/kayit"
                    onClick={closeRightDropdown}
                    className="font-brutal-heading block w-full px-3 py-2 text-left text-sm text-[#facc15] hover:bg-white/5 hover:text-[#fde047] transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                  <button
                    type="button"
                    onClick={() => { closeRightDropdown(); openDjPanel() }}
                    className="font-brutal-heading w-full px-3 py-2 text-left text-sm text-[#facc15] hover:bg-white/5 hover:text-[#fde047] transition-colors"
                  >
                    DJ Girişi
                  </button>
                </>
              )}
            </div>
          )}

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
      </div>

      {/* Mobil menü: overlay (içeriği itmez), lg altında, transparan arka plan */}
      <div
        className={cn(
          "lg:hidden absolute left-0 right-0 top-full backdrop-blur-sm transition-[max-height] duration-200 ease-out",
          mobileOpen ? "max-h-[85vh] overflow-y-auto" : "max-h-0 overflow-hidden"
        )}
        style={{ background: "rgba(17, 17, 17, 0.95)" }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col px-4 py-4 gap-2 pb-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={label}
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
          <div className="mt-4 pt-4 flex flex-col gap-2 items-start">
            {user ? (
              <>
                <span className="font-brutal-heading py-[10px] px-3 text-lg text-white/80">
                  {user.username}
                </span>
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
