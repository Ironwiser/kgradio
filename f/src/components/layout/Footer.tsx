export function Footer() {
  return (
    <footer className="low-transparent-footer fixed inset-x-0 bottom-0 z-20 text-white pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex h-[34px] max-w-7xl items-center justify-center px-2 sm:px-4 md:px-5 lg:px-6 xl:px-6 2xl:px-8 text-center">
        <p className="font-brutal-heading text-white/65 leading-tight text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[11px] tracking-[0.04em] px-1 sm:px-2">
          © {new Date().getFullYear()} LOWRadio — All rights reserved
        </p>
      </div>
    </footer>
  )
}
