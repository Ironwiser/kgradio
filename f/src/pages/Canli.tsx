import { Player } from "@/components/player/Player"

// AzuraCast canlı yayın URL'i (Lfo Radio istasyonu)
// Not: Slug ekran görüntüsüne göre "lfo_radio"
const LIVE_STREAM_URL =
  "https://radio.lforadio.omurgenc.dev/listen/lfo_radio/radio.mp3"

export function Canli() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] px-4 py-6 sm:py-12 bg-[#111111]">
      <div className="container relative z-10 mx-auto max-w-3xl min-w-0">
        <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold text-white">
          LfoRadio · Canlı Yayın
        </h1>

        <Player
          src={LIVE_STREAM_URL}
          title="LfoRadio Canlı"
          trackInfoUrl={undefined}
          autoPlay
          className="border-border bg-[#111111]"
        />
      </div>
    </section>
  )
}

