import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const API_BASE = "/api"

export function Kayit() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || "Kayıt başarısız.")
        return
      }
      navigate("/giris", { state: { message: "Hesabınız oluşturuldu. Giriş yapabilirsiniz." } })
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
          <div className="editorial-page-index"><span /> ACCOUNT / 05</div>
          <h1>Frekansa<br />Katıl</h1>
        </header>

        <div className="editorial-page-content editorial-form-panel">
          <p className="editorial-form-kicker">YENİ HESAP</p>
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
          <label htmlFor="username">
            Kullanıcı adı
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={cn("editorial-input")}
            placeholder="kullaniciadi"
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
            minLength={6}
            className={cn("editorial-input")}
            placeholder="••••••••"
          />
            </div>
            {error && <p className="editorial-form-error" role="alert">{error}</p>}
            <Button type="submit" disabled={loading} className="editorial-submit">
              <span>{loading ? "Kaydediliyor…" : "Kayıt Ol"}</span><i className="low-ui-arrow" aria-hidden />
            </Button>
          </form>
          <p className="editorial-form-switch">Zaten hesabınız var mı? <Link to="/giris">Giriş yap <i className="low-ui-arrow" aria-hidden /></Link></p>
        </div>
      </div>
    </section>
  )
}
