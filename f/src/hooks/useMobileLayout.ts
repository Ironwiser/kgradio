import { useEffect, useState } from "react"

const MOBILE_QUERY = "(max-width: 700px)"

export function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return isMobile
}
