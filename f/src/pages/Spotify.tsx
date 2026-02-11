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
        "relative min-h-[calc(100vh-4rem)] px-4 py-6 sm:py-12",
        "bg-[#111111]"
      )}
    >
      <div className="container relative z-10 mx-auto max-w-3xl min-w-0">
        <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold text-white">
          LfoRadio · Çalma Listeleri
        </h1>
        <Player
          src={playerSrc}
          title="LfoRadio"
          trackName={playerTrackName}
          artworkUrl={playerArtworkUrl}
          trackInfoUrl={selectedTrack ? undefined : "/api/audio/current"}
          autoPlay={!!selectedTrack}
          className="border-border bg-[#111111]"
        />

        <div className="mt-10 rounded-lg border border-border bg-[#111111] p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-3 text-xl font-medium text-white/80">
            <Music className="h-5 w-5" />
            Çalma Listeleri
          </h2>
          {listLoading ? (
            <p className="py-4 text-base text-white/60">Yükleniyor…</p>
          ) : trackList.length === 0 ? (
            <p className="py-4 text-base text-white/60">Henüz parça yok.</p>
          ) : (
            <ul className="space-y-1">
              {trackList.map((track) => (
                <li key={track.url}>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(track)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-base font-medium min-h-[40px] flex items-center touch-manipulation",
                      selectedTrack?.url === track.url
                        ? "bg-white text-black"
                        : "bg-[#777777] text-black hover:bg-[#999999]"
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
