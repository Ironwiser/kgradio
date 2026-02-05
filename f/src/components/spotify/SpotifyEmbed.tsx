import { cn } from "@/lib/utils"

interface SpotifyEmbedProps {
  src: string
  width?: string | number
  height?: string | number
  className?: string
}

export function SpotifyEmbed({
  src,
  width = "100%",
  height = 352,
  className,
}: SpotifyEmbedProps) {
  return (
    <iframe
      data-testid="embed-iframe"
      className={cn("rounded-xl", className)}
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify playlist"
    />
  )
}
