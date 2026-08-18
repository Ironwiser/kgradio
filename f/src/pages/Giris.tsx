import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { markAuthSession } from "@/lib/auth-session"

export function Giris() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAccessToken, setUser } = useAuth()
  const message = (location.state as { message?: string })?.message
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || "Giriş başarısız.")
        return
      }
      const token = data.accessToken
      markAuthSession()
      setAccessToken(token)
      const profileRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      if (profileRes.ok) {
        const userData = await profileRes.json()
        setUser(userData)
      } else {
        setUser({ id: 0, email: email, username: data.username ?? "" })
      }
      navigate("/", { replace: true })
    } catch {
      setError("Bağlantı hatası.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="editorial-page editorial-auth-page">
      <div className="editorial-page-shell editorial-auth-shell">
        <header className="editorial-page-header">
          <div className="editorial-page-index"><span /> ACCOUNT / 04</div>
          <h1>Tekrar<br />Hoş Geldin</h1>
          <p>Hesabına bağlan ve LOWRadio arşivine kaldığın yerden devam et.</p>
        </header>

        <div className="editorial-page-content editorial-form-panel">
          <p className="editorial-form-kicker">GİRİŞ</p>
          {message && <p className="editorial-form-message" role="status">{message}</p>}
          <form onSubmit={handleSubmit}>
            <div className="editorial-field">
          <label htmlFor="email">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cn("editorial-input")}
            placeholder="ornek@email.com"
          />
            </div>
            <div className="editorial-field">
          <label htmlFor="password">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cn("editorial-input")}
            placeholder="••••••••"
          />
            </div>
            {error && <p className="editorial-form-error" role="alert">{error}</p>}
            <Button type="submit" disabled={loading} className="editorial-submit">
              <span>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</span><i aria-hidden>↗</i>
            </Button>
          </form>
          <p className="editorial-form-switch">Hesabınız yok mu? <Link to="/kayit">Kayıt ol ↗</Link></p>
        </div>
      </div>
    </section>
  )
}
