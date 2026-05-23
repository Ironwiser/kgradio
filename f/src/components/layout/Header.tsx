import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Radio, Menu, X, UserRound, LogIn, UserPlus, ExternalLink, LogOut } from "lucide-react"
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
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  "nav-link-glitch font-brutal-heading flex h-full min-h-0 items-center justify-center transition-colors shrink-0",
                  "lg:text-base lg:px-2 xl:text-lg xl:px-3 2xl:text-xl 2xl:px-4",
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                )}
              >
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="relative flex h-full items-center gap-0.5 lg:gap-1 shrink-0" ref={rightDropdownRef}>
          {/* Masaüstü: giriş / hesap tetikleyicisi */}
          <button
            type="button"
            onClick={() => setRightDropdownOpen((o) => !o)}
            className={cn(
              "nav-link-glitch hidden lg:inline-flex font-brutal-heading",
              "h-full min-h-0 max-w-[10rem] items-center justify-center gap-1.5 shrink-0 leading-none",
              "bg-white/[0.04] px-2 xl:px-3 2xl:px-4",
              "lg:text-base xl:text-lg 2xl:text-xl text-white/85 transition-colors touch-manipulation",
              "hover:text-white",
              rightDropdownOpen && "bg-white/[0.08] text-white"
            )}
            aria-expanded={rightDropdownOpen}
            aria-haspopup="true"
          >
            {user ? (
              <span className="font-brutal-heading shrink-0 leading-none" aria-hidden>
                {user.username.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserRound className="auth-trigger-icon" strokeWidth={1} aria-hidden />
            )}
            <span className="truncate">{user ? user.username : "Giriş"}</span>
          </button>

          <div
            className={cn(
              "auth-dropdown-panel absolute right-0 top-full z-50 mt-1 hidden py-2 lg:block",
              rightDropdownOpen ? "auth-dropdown-open" : "auth-dropdown-closed"
            )}
            role="menu"
            aria-hidden={!rightDropdownOpen}
          >
            {user ? (
              <>
                <div className="auth-dropdown-user">
                  <span className="auth-dropdown-user-avatar font-brutal-heading" aria-hidden>
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <p className="font-brutal-heading text-base text-white whitespace-nowrap">
                    {user.username}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={rightDropdownOpen ? 0 : -1}
                  onClick={() => { closeRightDropdown(); logout() }}
                  className="auth-dropdown-item font-brutal-heading block text-left"
                >
                  <span className="auth-dropdown-item-inner text-red-400 hover:text-red-300">
                    <LogOut className="auth-dropdown-item-icon" aria-hidden />
                    Çıkış Yap
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  role="menuitem"
                  tabIndex={rightDropdownOpen ? 0 : -1}
                  onClick={closeRightDropdown}
                  className="auth-dropdown-item font-brutal-heading block text-left"
                >
                  <span className="auth-dropdown-item-inner text-white/90 hover:text-white">
                    <LogIn className="auth-dropdown-item-icon" aria-hidden />
                    Giriş Yap
                  </span>
                </Link>
                <Link
                  to="/kayit"
                  role="menuitem"
                  tabIndex={rightDropdownOpen ? 0 : -1}
                  onClick={closeRightDropdown}
                  className="auth-dropdown-item font-brutal-heading block text-left"
                >
                  <span className="auth-dropdown-item-inner text-[#facc15] hover:text-[#fde047]">
                    <UserPlus className="auth-dropdown-item-icon text-[#facc15]" aria-hidden />
                    Kayıt Ol
                  </span>
                </Link>
                <div className="auth-dropdown-divider" aria-hidden />
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={rightDropdownOpen ? 0 : -1}
                  onClick={() => { closeRightDropdown(); openDjPanel() }}
                  className="auth-dropdown-item font-brutal-heading block text-left"
                >
                  <span className="auth-dropdown-item-inner text-white/50 hover:text-white/85">
                    <ExternalLink className="auth-dropdown-item-icon" aria-hidden />
                    DJ Girişi
                  </span>
                </button>
              </>
            )}
          </div>

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

          <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2 items-stretch">
            <p className="px-3 font-brutal-heading text-xs uppercase tracking-wider text-white/45">
              {user ? "Hesap" : "Üyelik"}
            </p>
            {user ? (
              <>
                <span className="truncate px-3 font-brutal-heading text-lg text-white/80">{user.username}</span>
                <button
                  type="button"
                  onClick={() => { closeMobile(); logout() }}
                  className="nav-link-glitch font-brutal-heading mx-3 border border-border bg-white/[0.04] px-3 py-2.5 text-left text-lg text-red-400 touch-manipulation hover:text-red-300"
                >
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  onClick={closeMobile}
                  className="nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 items-center justify-center bg-white/90 px-4 py-2.5 text-lg font-semibold text-black touch-manipulation hover:bg-white"
                >
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/kayit"
                  onClick={closeMobile}
                  className="nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 items-center justify-center border border-[#facc15]/40 bg-[#facc15]/10 px-4 py-2.5 text-lg text-[#facc15] touch-manipulation hover:text-[#fde047]"
                >
                  <span>Kayıt Ol</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile()
                    openDjPanel()
                  }}
                  className="nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 items-center px-3 py-2.5 text-lg text-white/60 touch-manipulation hover:text-white/90 text-left"
                >
                  <span>DJ Girişi</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
