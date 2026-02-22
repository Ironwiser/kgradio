import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-brutal-heading text-2xl text-white mb-6">Giriş Yap</h1>
      {message && (
        <p className="mb-4 text-sm text-[#facc15]" role="status">
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cn(
              "w-full rounded-md border border-border bg-[#111] px-3 py-2 text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
            )}
            placeholder="ornek@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cn(
              "w-full rounded-md border border-border bg-[#111] px-3 py-2 text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
            )}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full bg-[#facc15] text-black hover:bg-[#fde047]">
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </Button>
      </form>
      <p className="mt-6 text-center text-white/70 text-sm">
        Hesabınız yok mu?{" "}
        <Link to="/kayit" className="text-[#facc15] hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  )
}
