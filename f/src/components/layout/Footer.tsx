export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-[#111111] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6 py-4 text-center">
        <p className="font-brutal-heading text-lg sm:text-2xl text-white/80">
          © {new Date().getFullYear()} LFO Radio — All rights reserved
        </p>
      </div>
    </footer>
  )
}
