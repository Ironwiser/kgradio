import * as React from "react"

type AzuraSong = {
  id?: string
  text?: string
  artist?: string
  title?: string
  album?: string
  art?: string
}

type AzuraSongEntry = {
  played_at?: number
  duration?: number
  song?: AzuraSong
}

type AzuraNowPlayingResponse = {
  is_online?: boolean
  station?: {
    name?: string
  }
  live?: {
    is_live?: boolean
    streamer_name?: string
  }
  now_playing?: AzuraSongEntry
  playing_next?: AzuraSongEntry | null
  song_history?: AzuraSongEntry[]
}

export type BroadcastSong = {
  id: string
  artist: string
  title: string
  album: string
  artworkUrl?: string
  playedAt?: number
}

export type BroadcastSnapshot = {
  isOnline: boolean
  isLive: boolean
  streamerName?: string
  stationName: string
  currentSong?: BroadcastSong
  nextSong?: BroadcastSong
  history: BroadcastSong[]
}

const EMPTY_SNAPSHOT: BroadcastSnapshot = {
  isOnline: false,
  isLive: false,
  stationName: "LOWRadio",
  history: [],
}

function normalizeSong(entry?: AzuraSongEntry | null): BroadcastSong | undefined {
  const song = entry?.song
  if (!song) return undefined

  const fallbackParts = song.text?.split(" - ") ?? []
  const artist = song.artist?.trim() || fallbackParts[0]?.trim() || "Bilinmeyen sanatçı"
  const title = song.title?.trim() || fallbackParts.slice(1).join(" - ").trim() || song.text?.trim()
  if (!title) return undefined

  return {
    id: song.id || `${entry?.played_at ?? "now"}-${artist}-${title}`,
    artist,
    title,
    album: song.album?.trim() || "",
    artworkUrl: song.art || undefined,
    playedAt: entry?.played_at,
  }
}

function normalizeSnapshot(data: AzuraNowPlayingResponse): BroadcastSnapshot {
  return {
    isOnline: Boolean(data.is_online),
    isLive: Boolean(data.live?.is_live),
    streamerName: data.live?.streamer_name || undefined,
    stationName: data.station?.name || "LOWRadio",
    currentSong: normalizeSong(data.now_playing),
    nextSong: normalizeSong(data.playing_next),
    history: (data.song_history ?? []).map(normalizeSong).filter((song): song is BroadcastSong => Boolean(song)).slice(0, 5),
  }
}

export function useAzuraCastNowPlaying(endpoint: string) {
  const [snapshot, setSnapshot] = React.useState<BroadcastSnapshot>(EMPTY_SNAPSHOT)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUnavailable, setIsUnavailable] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    let timer: number | undefined
    let isInitialRequest = true

    const load = async () => {
      const requestStartedAt = Date.now()
      try {
        const response = await fetch(endpoint, { cache: "no-store" })
        if (!response.ok) throw new Error(`AzuraCast ${response.status}`)
        const data = (await response.json()) as AzuraNowPlayingResponse
        if (!cancelled) {
          setSnapshot(normalizeSnapshot(data))
          setIsUnavailable(false)
        }
      } catch {
        if (!cancelled) setIsUnavailable(true)
      } finally {
        if (isInitialRequest) {
          const remainingDelay = Math.max(0, 1_000 - (Date.now() - requestStartedAt))
          if (remainingDelay > 0) {
            await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
          }
          isInitialRequest = false
        }
        if (!cancelled) {
          setIsLoading(false)
          // Parça geçişlerinin arayüze geç yansımaması için kısa aralıkla güncelle.
          timer = window.setTimeout(load, 5_000)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [endpoint])

  return { snapshot, isLoading, isUnavailable }
}
