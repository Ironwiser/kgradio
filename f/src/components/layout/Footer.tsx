export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-[#111111] text-white overflow-hidden">
      <div className="mx-auto flex min-h-8 sm:min-h-0 sm:h-10 md:h-12 lg:h-[52px] max-w-7xl items-center justify-center px-2 sm:px-4 md:px-5 lg:px-6 xl:px-6 2xl:px-8 text-center py-1 sm:py-0">
        <p className="font-brutal-heading text-white/80 leading-tight text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg px-1 sm:px-2">
          © {new Date().getFullYear()} LFO Radio — All rights reserved
        </p>
      </div>
    </footer>
  )
}
