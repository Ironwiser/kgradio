import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useLocation, useOutlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { PersistentLivePlayer } from "@/components/player/PersistentLivePlayer"
import { MobileLiveDock } from "@/components/player/MobileLiveDock"

const routeOrder: Record<string, number> = {
  "/": 0,
  "/canli": 1,
  "/calma-listeleri": 2,
  "/hakkimizda": 3,
  "/rasgele": 3,
  "/giris": 4,
  "/kayit": 4,
}

type RouteFrame = {
  path: string
  content: ReactNode
}

type RouteTransition = {
  from: RouteFrame
  to: RouteFrame
  direction: "forward" | "backward"
}

export function MainLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const [displayed, setDisplayed] = useState<RouteFrame>({
    path: location.pathname,
    content: outlet,
  })
  const [transition, setTransition] = useState<RouteTransition | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useLayoutEffect(() => {
    if (location.pathname === displayed.path) return

    const next = { path: location.pathname, content: outlet }
    const previousIndex = routeOrder[displayed.path] ?? 0
    const nextIndex = routeOrder[next.path] ?? previousIndex

    if (timerRef.current) clearTimeout(timerRef.current)
    setTransition({
      from: displayed,
      to: next,
      direction: nextIndex >= previousIndex ? "forward" : "backward",
    })
    setDisplayed(next)
    timerRef.current = setTimeout(() => setTransition(null), 520)
  }, [displayed, location.pathname, outlet])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <MobileLiveDock />
      <main className="route-transition-viewport flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className={`route-transition-stage${transition ? ` route-transition-${transition.direction}` : ""}`}>
          {transition ? (
            <>
            <div key={transition.from.path} className="route-transition-layer route-transition-outgoing" aria-hidden="true">
              {transition.from.content}
            </div>
            <div key={transition.to.path} className="route-transition-layer route-transition-incoming">
              {transition.to.content}
            </div>
            </>
          ) : (
            <div key={displayed.path} className="route-transition-layer route-transition-settled">
              {displayed.content}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <PersistentLivePlayer pathname={location.pathname} />
    </div>
  )
}
