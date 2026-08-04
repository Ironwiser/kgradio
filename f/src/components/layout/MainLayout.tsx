import { Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <div
      className={
        isHome
          ? "flex h-[100dvh] flex-col overflow-hidden bg-background"
          : "flex min-h-[100dvh] min-h-screen flex-col overflow-x-hidden bg-background"
      }
    >
      <Header />
      <main className={`flex min-h-0 w-full min-w-0 flex-1 flex-col ${isHome ? "overflow-hidden" : ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
