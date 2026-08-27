import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/auth-context"

export function AdminRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="admin-route-state">Yetki kontrol ediliyor…</div>
  if (!user) return <Navigate to="/giris" replace state={{ from: location.pathname, message: "Yönetim paneli için giriş yapın." }} />
  if (user.role !== "admin") return <Navigate to="/" replace />
  return <Outlet />
}
