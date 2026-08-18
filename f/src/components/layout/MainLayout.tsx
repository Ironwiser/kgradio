import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function MainLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
