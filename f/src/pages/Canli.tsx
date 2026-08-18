import { useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Player } from "@/components/player/Player"
import { useAzuraCastNowPlaying } from "@/hooks/useAzuraCastNowPlaying"

// AzuraCast canlı yayın URL'i (LOWRadio istasyonu)
const LIVE_STREAM_URL =
  "https://radio.lowradio.com/listen/lowradio/radio.mp3"
const NOW_PLAYING_URL =
  "https://radio.lowradio.com/api/nowplaying/lowradio"

function formatPlayedAt(timestamp?: number) {
  if (!timestamp) return "—"
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000))
}

function MovingTrackTitle({ title }: { title: string }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const [overflowDistance, setOverflowDistance] = useState(0)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const text = textRef.current
    if (!viewport || !text) return

    const measure = () => {
      setOverflowDistance(Math.max(0, text.scrollWidth - viewport.clientWidth + 24))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(text)
    return () => observer.disconnect()
  }, [title])

  return (
    <div
      ref={viewportRef}
      className="live-studio-title-window"
      data-overflow={overflowDistance > 0 ? "true" : "false"}
      style={{ "--track-title-distance": `${overflowDistance}px` } as CSSProperties}
    >
      <h1 ref={textRef} id="live-studio-title">{title}</h1>
    </div>
  )
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
            <div
              key={currentTrack?.id || "station-idle"}
              className="live-studio-heading player-track-transition"
            >
              <div className="live-studio-track-panel">
                <p>{snapshot.isLive ? "LIVE BROADCAST" : "AUTODJ TRANSMISSION"}</p>
                <MovingTrackTitle
                  title={currentTrack?.title || (isLoading ? "Sinyal aranıyor" : "Canlı yayın")}
                />
                <strong>{currentTrack?.artist || "LOWRadio kesintisiz seçki"}</strong>
                <span>
                  {snapshot.streamerName
                    ? `Yayıncı · ${snapshot.streamerName}`
                    : currentTrack?.album || "Bağımsız yayın · Dünya çapında"}
                </span>
              </div>
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
                isLive
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

