import * as React from "react"
import { cn } from "@/lib/utils"
import { Player } from "@/components/player/Player"

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

export function Listeler() {
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
  const currentIndex = selectedTrack
    ? trackList.findIndex((t) => t.url === selectedTrack.url)
    : -1
  const canGoPrevious = currentIndex > 0
  const canGoNext =
    currentIndex >= 0
      ? currentIndex < trackList.length - 1
      : trackList.length > 0
  const handlePrevious = () => {
    if (currentIndex > 0) setSelectedTrack(trackList[currentIndex - 1])
  }
  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < trackList.length - 1) {
      setSelectedTrack(trackList[currentIndex + 1])
    } else if (currentIndex === -1 && trackList.length > 0) {
      setSelectedTrack(trackList[0])
    }
  }

  return (
    <section className="editorial-page editorial-playlists-page">
      <div className="editorial-page-shell">
        <header className="editorial-page-header">
          <div className="editorial-page-index"><span /> ARCHIVE / 02</div>
          <h1>Çalma<br />Listeleri</h1>
          <p>Arşivden seçilmiş parçalar. Bir kaydı seç ve frekansa bağlan.</p>
        </header>

        <div className="editorial-page-content editorial-playlists-content">
          <Player
            src={playerSrc}
            title="LOWRadio"
            trackName={playerTrackName}
            artworkUrl={playerArtworkUrl}
            trackInfoUrl={selectedTrack ? undefined : "/api/audio/current"}
            autoPlay={!!selectedTrack}
            allowPersistentPlayback
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            className="editorial-player"
          />

          <div className="editorial-track-panel">
            <div className="editorial-track-heading">
              <h2>Arşiv</h2>
              <span>{String(trackList.length).padStart(2, "0")} KAYIT</span>
            </div>
          {listLoading ? (
            <p className="editorial-track-state">Yükleniyor…</p>
          ) : trackList.length === 0 ? (
            <p className="editorial-track-state">Henüz parça yok.</p>
          ) : (
            <ul className="editorial-track-list">
              {trackList.map((track, index) => (
                <li key={track.url}>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(track)}
                    className={cn(
                      "editorial-track-button",
                      selectedTrack?.url === track.url
                        ? "editorial-track-active"
                        : ""
                    )}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{track.displayName}</strong>
                    <i aria-hidden>↗</i>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </section>
  )
}
