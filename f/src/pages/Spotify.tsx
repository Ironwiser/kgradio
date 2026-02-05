import * as React from "react"
import { cn } from "@/lib/utils"
import { Player } from "@/components/player/Player"
import { Music } from "lucide-react"

/** Backend'den MP3 stream; yoksa .env'deki VITE_STREAM_URL */
const DEFAULT_STREAM_URL =
  import.meta.env.VITE_STREAM_URL || "/api/audio/stream"

export interface TrackItem {
  name: string
  displayName: string
  url: string
  /** MP3'ten çıkarılan kapak görseli API URL'i (opsiyonel) */
  artworkUrl?: string
}

export function Spotify() {
  const [trackList, setTrackList] = React.useState<TrackItem[]>([])
  const [selectedTrack, setSelectedTrack] = React.useState<TrackItem | null>(null)
  const [listLoading, setListLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/audio/list")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTrackList(Array.isArray(data) ? data : [])
        setListLoading(false)
      })
      .catch(() => setListLoading(false))
  }, [])

  const playerSrc = selectedTrack ? selectedTrack.url : DEFAULT_STREAM_URL
  const playerTrackName = selectedTrack ? selectedTrack.displayName : undefined
  const playerArtworkUrl = selectedTrack?.artworkUrl

  return (
    <section
      className={cn(
        "relative min-h-[calc(100vh-4rem)] px-4 py-12",
        "bg-gradient-to-r from-blue-600 via-blue-500/90 to-cyan-500"
      )}
    >
      <div className="container relative z-10 mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white drop-shadow-sm">
          Çalma Listeleri
        </h1>
        <Player
          src={playerSrc}
          title="KG Radio"
          trackName={playerTrackName}
          artworkUrl={playerArtworkUrl}
          trackInfoUrl={selectedTrack ? undefined : "/api/audio/current"}
          autoPlay={!!selectedTrack}
          className="border-white/20 bg-slate-900/90 shadow-xl backdrop-blur"
        />

        <div className="mt-8 rounded-2xl border border-white/20 bg-slate-900/90 p-4 shadow-xl backdrop-blur sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white/80">
            <Music className="h-4 w-4" />
            Çalma Listeleri
          </h2>
          {listLoading ? (
            <p className="py-4 text-sm text-white/60">Yükleniyor…</p>
          ) : trackList.length === 0 ? (
            <p className="py-4 text-sm text-white/60">Henüz parça yok.</p>
          ) : (
            <ul className="space-y-1">
              {trackList.map((track) => (
                <li key={track.url}>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(track)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      selectedTrack?.url === track.url
                        ? "bg-primary/20 text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {track.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
