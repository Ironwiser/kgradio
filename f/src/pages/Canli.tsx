import { Player } from "@/components/player/Player"
import { useAzuraCastNowPlaying } from "@/hooks/useAzuraCastNowPlaying"

// AzuraCast canlı yayın URL'i (LOWRadio istasyonu)
// Not: Slug ekran görüntüsüne göre "lfo_radio"
const LIVE_STREAM_URL =
  "https://radio.lforadio.omurgenc.dev/listen/lfo_radio/radio.mp3"
const NOW_PLAYING_URL =
  "https://radio.lforadio.omurgenc.dev/api/nowplaying/lfo_radio"

function formatPlayedAt(timestamp?: number) {
  if (!timestamp) return "—"
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000))
}

export function Canli() {
  const { snapshot, isLoading, isUnavailable } = useAzuraCastNowPlaying(NOW_PLAYING_URL)
  const currentTrack = snapshot.currentSong

  return (
    <section className="editorial-page live-studio-page">
      <div className="live-studio-shell">
        <header className="live-studio-rail">
          <div className="editorial-page-index"><span /> LIVE / 01</div>
          <p>LOWRADIO BROADCAST SYSTEM</p>
          <div className="live-studio-signal">
            <i className={snapshot.isOnline ? "is-online" : undefined} />
            {snapshot.isOnline ? "SIGNAL ONLINE" : "SIGNAL STANDBY"}
          </div>
        </header>

        <main className="live-studio-main">
          <section className="live-studio-hero" aria-labelledby="live-studio-title">
            <div className="live-studio-heading">
              <p>{snapshot.isLive ? "LIVE BROADCAST" : "AUTODJ TRANSMISSION"}</p>
              <h1 id="live-studio-title">
                {currentTrack?.title || (isLoading ? "Sinyal aranıyor" : "Canlı yayın")}
              </h1>
              <strong>{currentTrack?.artist || "LOWRadio kesintisiz seçki"}</strong>
              <span>
                {snapshot.streamerName
                  ? `Yayıncı · ${snapshot.streamerName}`
                  : currentTrack?.album || "Bağımsız yayın · Dünya çapında"}
              </span>
            </div>

            <div className="live-studio-player-wrap">
              <div className="live-studio-player-label">
                <span>NOW PLAYING</span>
                <span>{snapshot.stationName}</span>
              </div>
              <Player
                src={LIVE_STREAM_URL}
                title={snapshot.stationName}
                trackName={currentTrack ? `${currentTrack.artist} — ${currentTrack.title}` : undefined}
                artworkUrl={currentTrack?.artworkUrl}
                autoPlay
                className="editorial-player live-studio-player"
              />
            </div>
          </section>

          <section className="live-studio-board">
            <div className="live-studio-history" aria-labelledby="recently-played-heading">
              <div className="live-studio-board-heading">
                <p id="recently-played-heading">RECENT TRANSMISSIONS</p>
                <span>SON ÇALINANLAR</span>
              </div>

              {snapshot.history.length > 0 ? (
                <ol>
                  {snapshot.history.map((song, index) => (
                    <li key={`${song.id}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{song.title}</strong>
                        <p>{song.artist}</p>
                      </div>
                      <time>{formatPlayedAt(song.playedAt)}</time>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="live-studio-empty">
                  <span>01—05</span>
                  <p>{isUnavailable ? "Yayın geçmişi yeni sunucu bağlantısını bekliyor." : "Yayın geçmişi hazırlanıyor."}</p>
                </div>
              )}
            </div>

            <aside className="live-studio-side">
              <div>
                <p>NEXT SIGNAL</p>
                <strong>
                  {snapshot.nextSong
                    ? `${snapshot.nextSong.artist} — ${snapshot.nextSong.title}`
                    : "Akış güncelleniyor"}
                </strong>
              </div>
              <dl>
                <div><dt>STATION</dt><dd>{snapshot.stationName}</dd></div>
                <div><dt>ACCESS</dt><dd>WORLDWIDE</dd></div>
              </dl>
            </aside>
          </section>
        </main>
      </div>
    </section>
  )
}

