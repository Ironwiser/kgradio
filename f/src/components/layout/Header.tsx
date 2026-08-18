import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, LogIn, UserPlus, ExternalLink, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navLinks = [
  { to: "/canli", label: "Canlı Yayın" },
  { to: "/calma-listeleri", label: "Çalma Listeleri" },
  { to: "/hakkimizda", label: "Hakkımızda" },
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
    window.open("https://radio.lowradio.com", "_blank", "noopener,noreferrer")
  }

  return (
    <header className="low-site-header sticky top-0 z-50 w-full border-b border-[#1f1f1f] bg-black overflow-visible">
      <div className="low-site-header-frame w-full px-4 lg:px-[32px]">
        <div className="low-site-header-grid mx-auto flex h-[52px] w-full max-w-[1600px] min-w-0 items-center justify-between overflow-visible lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        {/* Sol alan – marka; lg’de sağ ile aynı genişlik (w-44) */}
        <Link
          to="/"
          className="low-site-brand logo-link-glitch flex items-center gap-1.5 sm:gap-2 lg:gap-1 pr-2 sm:pr-3 md:pr-4 lg:pr-2 h-full shrink-0 min-w-0 lg:justify-self-start"
          onClick={closeMobile}
        >
          <img className="low-site-brand-logo" src="/images/low-logo.png" alt="LOWRadio" />
          <span className="low-site-brand-radio">Radio</span>
        </Link>

        <nav className="low-site-nav hidden lg:flex h-full min-w-0 items-center justify-center gap-[56px] xl:gap-[76px]">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  "low-site-nav-link nav-link-glitch font-brutal-heading flex h-full min-h-0 items-center justify-center transition-colors shrink-0",
                  "lg:text-[0.41rem] lg:px-1 xl:text-[0.46rem] xl:px-1.5 2xl:text-[0.5rem] 2xl:px-2",
                  isActive ? "low-site-nav-link-active text-white" : "text-white/70 hover:text-white"
                )}
              >
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="relative flex h-full shrink-0 items-center gap-0.5 lg:gap-1 lg:justify-self-end" ref={rightDropdownRef}>
          {/* Masaüstü: giriş / hesap tetikleyicisi */}
          <button
            type="button"
            onClick={() => setRightDropdownOpen((o) => !o)}
            className={cn(
              "low-site-account nav-link-glitch hidden lg:inline-flex font-brutal-heading",
              "h-full min-h-0 max-w-[10rem] items-center justify-center gap-1.5 shrink-0 leading-none",
              "bg-white/[0.04] px-1 xl:px-1.5 2xl:px-2",
              "lg:text-[0.41rem] xl:text-[0.46rem] 2xl:text-[0.5rem] text-white/85 transition-colors touch-manipulation",
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
            ) : null}
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
            className="low-site-menu-trigger flex h-8 w-8 md:h-[32px] md:w-[32px] shrink-0 items-center justify-center rounded text-white lg:hidden touch-manipulation"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X className="h-5 w-5 md:h-[20px] md:w-[20px]" /> : <Menu className="h-5 w-5 md:h-[20px] md:w-[20px]" />}
          </button>
        </div>
      </div>
      </div>

      {/* Mobil menü: overlay (içeriği itmez), lg altında, transparan arka plan */}
      <div
        className={cn(
          "low-site-mobile-menu lg:hidden absolute left-0 right-0 top-full backdrop-blur-sm transition-[max-height] duration-200 ease-out",
          mobileOpen ? "max-h-[85vh] overflow-y-auto" : "max-h-0 overflow-hidden"
        )}
        style={{ background: "rgba(0, 0, 0, 0.96)" }}
        aria-hidden={!mobileOpen}
      >
        <nav className="low-mobile-nav flex flex-col px-4 py-4 md:px-[16px] md:py-[16px] gap-2 md:gap-[8px] pb-6 md:pb-[24px]">
          {navLinks.map(({ to, label }, index) => (
            <Link
              key={label}
              to={to}
              onClick={closeMobile}
              className={cn(
                "low-mobile-nav-link nav-link-glitch font-brutal-heading py-[10px] px-3 text-xl md:text-[20px] capitalize transition-colors touch-manipulation",
                location.pathname === to ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              <span className="low-mobile-nav-index">0{index + 1}</span>
              <span>{label}</span>
              <span className="low-mobile-nav-arrow" aria-hidden>↗</span>
            </Link>
          ))}

          <div className="low-mobile-account mt-4 border-t border-border pt-4 flex flex-col gap-2 items-stretch">
            <p className="px-3 font-brutal-heading text-xs md:text-[12px] uppercase tracking-wider text-white/45">
              {user ? "Hesap" : "Üyelik"}
            </p>
            {user ? (
              <>
                <span className="truncate px-3 font-brutal-heading text-lg md:text-[18px] text-white/80">{user.username}</span>
                <button
                  type="button"
                  onClick={() => { closeMobile(); logout() }}
                  className="nav-link-glitch font-brutal-heading mx-3 border border-border bg-white/[0.04] px-3 py-2.5 text-left text-lg md:text-[18px] text-red-400 touch-manipulation hover:text-red-300"
                >
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  onClick={closeMobile}
                  className="low-mobile-login nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 md:min-h-[44px] items-center justify-center bg-white/90 px-4 md:px-[16px] py-2.5 md:py-[10px] text-lg md:text-[18px] font-semibold text-black touch-manipulation hover:bg-white"
                >
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/kayit"
                  onClick={closeMobile}
                  className="low-mobile-register nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 md:min-h-[44px] items-center justify-center border border-[#facc15]/40 bg-[#facc15]/10 px-4 md:px-[16px] py-2.5 md:py-[10px] text-lg md:text-[18px] text-[#facc15] touch-manipulation hover:text-[#fde047]"
                >
                  <span>Kayıt Ol</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile()
                    openDjPanel()
                  }}
                  className="low-mobile-dj nav-link-glitch font-brutal-heading mx-3 inline-flex min-h-11 md:min-h-[44px] items-center px-3 md:px-[12px] py-2.5 md:py-[10px] text-lg md:text-[18px] text-white/60 touch-manipulation hover:text-white/90 text-left"
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
