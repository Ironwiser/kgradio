export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t-[4px] border-border bg-[#111111] text-white overflow-hidden">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-center px-4 sm:px-6 border-x-0 sm:border-x-[4px] border-border text-center">
        <p className="font-brutal-heading text-xl text-white/80">
          © {new Date().getFullYear()} LFO Radio — All rights reserved
        </p>
      </div>
    </footer>
  )
}
