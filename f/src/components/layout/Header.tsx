import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#020617]/95 backdrop-blur supports-[backdrop-filter]:bg-[#020617]/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Radio className="h-5 w-5 text-primary-foreground" aria-hidden />
          </span>
          <span className="text-lg font-semibold text-white">KG Radio</span>
        </Link>

        {/* Nav: Çalma Listeleri + Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/calma-listeleri"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Çalma Listeleri
          </Link>
          <nav className="flex items-center gap-2" aria-label="Eylemler">
          <Button
            asChild
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            <Link to="/calma-listeleri">DİNLE</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/rasgele">RASGELE</Link>
          </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
