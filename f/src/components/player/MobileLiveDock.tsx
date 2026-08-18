import { Player } from "@/components/player/Player"
import { useAzuraCastNowPlaying } from "@/hooks/useAzuraCastNowPlaying"
import { useMobileLayout } from "@/hooks/useMobileLayout"

const LIVE_STREAM_URL = "https://radio.lowradio.com/listen/lowradio/radio.mp3"
const NOW_PLAYING_URL = "https://radio.lowradio.com/api/nowplaying/lowradio"

export function MobileLiveDock() {
  const isMobile = useMobileLayout()
  const { snapshot } = useAzuraCastNowPlaying(NOW_PLAYING_URL)
  const currentTrack = snapshot.currentSong

  if (!isMobile) return null

  return (
    <section className="mobile-live-dock" aria-label="Sabit canlı yayın playerı">
      <div className="mobile-live-dock-heading">
        <span aria-hidden />
        LIVE TRANSMISSION
      </div>
      <Player
        src={LIVE_STREAM_URL}
        title={snapshot.stationName || "LOWRadio"}
        trackName={currentTrack ? `${currentTrack.artist} — ${currentTrack.title}` : undefined}
        artworkUrl={currentTrack?.artworkUrl}
        isLive
        className="editorial-player mobile-live-dock-player"
      />
    </section>
  )
}
