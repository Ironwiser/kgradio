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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-brutal-heading text-2xl text-white mb-6">Kayıt Ol</h1>
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
          <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1">
            Kullanıcı adı
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={cn(
              "w-full rounded-md border border-border bg-[#111] px-3 py-2 text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
            )}
            placeholder="kullaniciadi"
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
            minLength={6}
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
          {loading ? "Kaydediliyor…" : "Kayıt Ol"}
        </Button>
      </form>
      <p className="mt-6 text-center text-white/70 text-sm">
        Zaten hesabınız var mı?{" "}
        <Link to="/giris" className="text-[#facc15] hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}
