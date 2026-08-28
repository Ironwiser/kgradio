import express from "express"
import { authenticateJWT, requireAdmin } from "../middleware/auth.js"
import { getCustomDbConnection } from "../db.js"

const router = express.Router()
let tokenCache = null
let profileTracksCache = null
const PROFILE_TRACKS_CACHE_MS = 5 * 60 * 1000

function decodeXml(value = "") {
  return value
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim()
}

function xmlText(block, tag) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = block.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"))
  return decodeXml(match?.[1] || "")
}

function xmlAttribute(block, tag, attribute) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const tagMatch = block.match(new RegExp(`<${escapedTag}\\b[^>]*>`, "i"))
  if (!tagMatch) return ""
  const attributeMatch = tagMatch[0].match(new RegExp(`${escapedAttribute}=["']([^"']+)["']`, "i"))
  return decodeXml(attributeMatch?.[1] || "")
}

function stableTrackId(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return -Math.max(1, Math.abs(hash >>> 0))
}

async function getRssUrl(profileUrl) {
  if (process.env.SOUNDCLOUD_RSS_URL) return process.env.SOUNDCLOUD_RSS_URL

  const preview = await oEmbed(profileUrl)
  const encodedResourceUrl = (preview.html || "").match(/[?&]url=([^&"']+)/i)?.[1]
  const decodedResourceUrl = encodedResourceUrl ? decodeURIComponent(encodedResourceUrl) : ""
  const userId = decodedResourceUrl.match(/api\.soundcloud\.com\/users\/(\d+)/i)?.[1]
  if (!userId) throw new Error("SoundCloud RSS kullanıcı kimliği bulunamadı.")
  return `https://feeds.soundcloud.com/users/soundcloud:users:${userId}/sounds.rss`
}

async function getProfileTracksFromRss(profileUrl) {
  const rssUrl = await getRssUrl(profileUrl)
  let endpoint = new URL(rssUrl)
  const pages = []
  const visitedPages = new Set()
  while (endpoint && !visitedPages.has(endpoint.href) && pages.length < 10) {
    visitedPages.add(endpoint.href)
    const response = await fetch(endpoint, { headers: { Accept: "application/rss+xml, application/xml, text/xml" } })
    if (!response.ok) throw new Error("LOWRadio SoundCloud RSS akışı alınamadı.")
    const xml = await response.text()
    pages.push(xml)

    const nextLink = (xml.match(/<atom:link\b(?=[^>]*\brel=["']next["'])[^>]*\bhref=["']([^"']+)["'][^>]*\/?\s*>/i) ||
      xml.match(/<atom:link\b(?=[^>]*\bhref=["']([^"']+)["'])[^>]*\brel=["']next["'][^>]*\/?\s*>/i))?.[1]
    if (!nextLink) break
    const nextEndpoint = new URL(decodeXml(nextLink))
    if (nextEndpoint.protocol !== "https:" || nextEndpoint.hostname !== "feeds.soundcloud.com") {
      throw new Error("SoundCloud RSS sayfalama bağlantısı geçersiz.")
    }
    endpoint = nextEndpoint
  }

  const firstPage = pages[0] || ""
  const channelAuthor = xmlText(firstPage, "itunes:author") || xmlText(firstPage, "title") || "LOWRadio"
  const channelArtwork = xmlAttribute(firstPage, "itunes:image", "href") || xmlText(firstPage, "url") || null
  const items = pages.flatMap((xml) => xml.match(/<item\b[\s\S]*?<\/item>/gi) || [])
  const seen = new Set()

  return items.map((item) => {
    const url = xmlText(item, "link")
    const title = xmlText(item, "title")
    const authorName = xmlText(item, "itunes:author") || xmlText(item, "dc:creator") || channelAuthor
    const artworkUrl = xmlAttribute(item, "itunes:image", "href") ||
      xmlAttribute(item, "media:thumbnail", "url") || channelArtwork
    return { id: stableTrackId(url || title), kind: "track", url, title, authorName, artworkUrl }
  }).filter((track) => {
    if (!isSoundCloudUrl(track.url) || !track.title || seen.has(track.url)) return false
    seen.add(track.url)
    return true
  })
}

function isSoundCloudUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && ["soundcloud.com", "www.soundcloud.com", "on.soundcloud.com"].includes(url.hostname)
  } catch { return false }
}

async function oEmbed(url) {
  if (!isSoundCloudUrl(url)) throw Object.assign(new Error("Geçerli bir SoundCloud bağlantısı girin."), { status: 400 })
  const parsed = new URL(url)
  const pathParts = parsed.pathname.split("/").filter(Boolean)
  const isTracksTab = pathParts.length === 2 && pathParts[1].toLowerCase() === "tracks"
  const resolvedUrl = isTracksTab ? `${parsed.origin}/${pathParts[0]}` : url
  const endpoint = new URL("https://soundcloud.com/oembed")
  endpoint.searchParams.set("format", "json")
  endpoint.searchParams.set("url", resolvedUrl)
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } })
  if (!response.ok) throw Object.assign(new Error("SoundCloud bağlantısı doğrulanamadı."), { status: 422 })
  const data = await response.json()
  const resourceType = pathParts.includes("sets") ? "playlist" : pathParts.length <= 1 || isTracksTab ? "profile" : "track"
  return {
    url,
    title: data.title || data.author_name || "SoundCloud",
    authorName: data.author_name || "SoundCloud",
    artworkUrl: data.thumbnail_url || null,
    providerUrl: data.author_url || "https://soundcloud.com",
    html: data.html || null,
    resourceType,
  }
}

async function getSoundCloudToken() {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const response = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  })
  if (!response.ok) throw new Error("SoundCloud API kimlik doğrulaması başarısız.")
  const data = await response.json()
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 }
  return tokenCache.value
}

async function getProfileTracks(profileUrl) {
  if (!isSoundCloudUrl(profileUrl)) return null
  if (
    profileTracksCache?.profileUrl === profileUrl &&
    profileTracksCache.expiresAt > Date.now()
  ) return profileTracksCache.tracks

  const token = await getSoundCloudToken()
  if (!token) {
    const tracks = await getProfileTracksFromRss(profileUrl)
    profileTracksCache = { profileUrl, tracks, expiresAt: Date.now() + PROFILE_TRACKS_CACHE_MS }
    return tracks
  }
  const headers = { Authorization: `OAuth ${token}`, Accept: "application/json" }
  const parsedProfileUrl = new URL(profileUrl)
  const profileParts = parsedProfileUrl.pathname.split("/").filter(Boolean)
  const resolvableProfileUrl = profileParts.length === 2 && profileParts[1].toLowerCase() === "tracks"
    ? `${parsedProfileUrl.origin}/${profileParts[0]}`
    : profileUrl
  const resolveEndpoint = new URL("https://api.soundcloud.com/resolve")
  resolveEndpoint.searchParams.set("url", resolvableProfileUrl)
  const resolvedResponse = await fetch(resolveEndpoint, { headers })
  if (!resolvedResponse.ok) throw new Error("LOWRadio SoundCloud profili çözümlenemedi.")
  const profile = await resolvedResponse.json()
  const profileId = profile.urn || profile.id
  if (!profileId) throw new Error("LOWRadio SoundCloud profil kimliği bulunamadı.")

  let endpoint = new URL(`https://api.soundcloud.com/users/${encodeURIComponent(profileId)}/tracks`)
  endpoint.searchParams.set("limit", "200")
  endpoint.searchParams.set("linked_partitioning", "true")

  const allTracks = []
  const visitedPages = new Set()
  while (endpoint && !visitedPages.has(endpoint.href)) {
    visitedPages.add(endpoint.href)
    const tracksResponse = await fetch(endpoint, { headers })
    if (!tracksResponse.ok) throw new Error("LOWRadio SoundCloud parçaları alınamadı.")
    const payload = await tracksResponse.json()
    allTracks.push(...(Array.isArray(payload) ? payload : payload.collection || []))

    if (Array.isArray(payload) || !payload.next_href) break
    const nextEndpoint = new URL(payload.next_href)
    if (nextEndpoint.protocol !== "https:" || nextEndpoint.hostname !== "api.soundcloud.com") {
      throw new Error("SoundCloud sayfalama bağlantısı geçersiz.")
    }
    endpoint = nextEndpoint
  }

  const seen = new Set()
  const tracks = allTracks.map((track) => ({
    id: -Math.abs(Number(track.id) || 0),
    kind: "track",
    url: track.permalink_url,
    title: track.title,
    authorName: track.user?.username || profile.username || "LOWRadio",
    artworkUrl: track.artwork_url || track.user?.avatar_url || profile.avatar_url || null,
  })).filter((track) => {
    if (!track.id || !track.url || !track.title || seen.has(track.id)) return false
    seen.add(track.id)
    return true
  })

  profileTracksCache = {
    profileUrl,
    tracks,
    expiresAt: Date.now() + PROFILE_TRACKS_CACHE_MS,
  }
  return tracks
}

router.get("/soundcloud/catalog", async (_req, res) => {
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const [settings, lowradio, artists] = await Promise.all([
      db.query("SELECT lowradio_profile_url, lowradio_tracks_url, lowradio_profile_name, lowradio_artwork_url FROM soundcloud_settings WHERE id=1"),
      db.query(`SELECT id, kind, soundcloud_url AS url, title,
        author_name AS "authorName", artwork_url AS "artworkUrl"
        FROM soundcloud_items WHERE scope='lowradio' AND active=true ORDER BY sort_order,id`),
      db.query(`SELECT a.id,a.profile_url,a.name,a.artwork_url,a.description,
        COALESCE(json_agg(json_build_object('id',i.id,'kind',i.kind,'url',i.soundcloud_url,'title',i.title,'authorName',i.author_name,'artworkUrl',i.artwork_url) ORDER BY i.sort_order,i.id) FILTER (WHERE i.id IS NOT NULL),'[]') AS items
        FROM soundcloud_artists a LEFT JOIN soundcloud_items i ON i.artist_id=a.id AND i.active=true
        WHERE a.active=true GROUP BY a.id ORDER BY a.sort_order,a.id`),
    ])
    const profile = settings.rows[0] || null
    let profileTracks = null
    try { profileTracks = await getProfileTracks(profile?.lowradio_tracks_url || profile?.lowradio_profile_url) }
    catch (error) { console.warn("SoundCloud profil parçaları alınamadı; kayıtlı katalog kullanılıyor:", error.message) }
    res.json({ profile, lowradio: profileTracks || lowradio.rows, artists: artists.rows })
  } catch (error) { res.status(500).json({ message: "SoundCloud kataloğu alınamadı.", error: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.use("/soundcloud/admin", authenticateJWT, requireAdmin)

router.get("/soundcloud/admin/status", async (_req, res) => {
  res.json({ searchEnabled: Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET) })
})

router.get("/soundcloud/admin/resolve", async (req, res) => {
  try {
    const preview = await oEmbed(String(req.query.url || ""))
    if (req.query.expected === "profile" && preview.resourceType !== "profile") {
      return res.status(422).json({ message: "Bu bağlantı bir SoundCloud sanatçı profiline ait değil." })
    }
    res.json(preview)
  }
  catch (error) { res.status(error.status || 502).json({ message: error.message }) }
})

router.get("/soundcloud/admin/search", async (req, res) => {
  try {
    const token = await getSoundCloudToken()
    if (!token) return res.status(503).json({ message: "SoundCloud API araması yapılandırılmamış." })
    const type = ["users", "tracks", "playlists"].includes(String(req.query.type)) ? String(req.query.type) : "users"
    const endpoint = new URL(`https://api.soundcloud.com/${type}`)
    endpoint.searchParams.set("q", String(req.query.q || ""))
    endpoint.searchParams.set("limit", "12")
    endpoint.searchParams.set("linked_partitioning", "true")
    const response = await fetch(endpoint, { headers: { Authorization: `OAuth ${token}`, Accept: "application/json" } })
    if (!response.ok) throw new Error("SoundCloud araması başarısız.")
    const payload = await response.json()
    const collection = Array.isArray(payload) ? payload : payload.collection || []
    res.json(collection.map((item) => ({
      urn: item.urn || String(item.id),
      name: item.username || item.title,
      url: item.permalink_url,
      artworkUrl: item.avatar_url || item.artwork_url || item.user?.avatar_url || null,
      authorName: item.user?.username || item.username || null,
      kind: type === "users" ? "profile" : type === "playlists" ? "playlist" : "track",
    })))
  } catch (error) { res.status(502).json({ message: error.message }) }
})

router.get("/soundcloud/admin/data", async (_req, res) => {
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const [settings, artists, items] = await Promise.all([
      db.query("SELECT * FROM soundcloud_settings WHERE id=1"),
      db.query("SELECT * FROM soundcloud_artists ORDER BY sort_order,id"),
      db.query("SELECT * FROM soundcloud_items ORDER BY scope,sort_order,id"),
    ])
    res.json({ settings: settings.rows[0] || null, artists: artists.rows, items: items.rows })
  } catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.put("/soundcloud/admin/settings", async (req, res) => {
  const { profileUrl, tracksUrl, profileName, artworkUrl } = req.body || {}
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(`INSERT INTO soundcloud_settings(id,lowradio_profile_url,lowradio_tracks_url,lowradio_profile_name,lowradio_artwork_url,updated_at)
      VALUES(1,$1,$2,$3,$4,now()) ON CONFLICT(id) DO UPDATE SET lowradio_profile_url=$1,lowradio_tracks_url=$2,lowradio_profile_name=$3,lowradio_artwork_url=$4,updated_at=now() RETURNING *`, [profileUrl || null, tracksUrl || profileUrl || null, profileName || null, artworkUrl || null])
    profileTracksCache = null
    res.json(result.rows[0])
  } catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.post("/soundcloud/admin/artists", async (req, res) => {
  const { profileUrl, name, artworkUrl, description, sortOrder = 0, active = true } = req.body || {}
  if (!isSoundCloudUrl(profileUrl) || !name) return res.status(400).json({ message: "Doğrulanmış profil ve sanatçı adı zorunludur." })
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(`INSERT INTO soundcloud_artists(profile_url,name,artwork_url,description,sort_order,active)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [profileUrl, name, artworkUrl || null, description || null, sortOrder, active])
    res.status(201).json(result.rows[0])
  } catch (error) { res.status(error.code === "23505" ? 409 : 500).json({ message: error.code === "23505" ? "Bu sanatçı zaten ekli." : error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.patch("/soundcloud/admin/artists/:id", async (req, res) => {
  const { name, description, sortOrder, active } = req.body || {}
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(`UPDATE soundcloud_artists SET name=COALESCE($1,name),description=COALESCE($2,description),sort_order=COALESCE($3,sort_order),active=COALESCE($4,active),updated_at=now() WHERE id=$5 RETURNING *`, [name ?? null, description ?? null, sortOrder ?? null, active ?? null, req.params.id])
    if (!result.rows[0]) return res.status(404).json({ message: "Sanatçı bulunamadı." })
    res.json(result.rows[0])
  } catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.delete("/soundcloud/admin/artists/:id", async (req, res) => {
  let db
  try { db = await getCustomDbConnection("lforadio"); await db.query("DELETE FROM soundcloud_artists WHERE id=$1", [req.params.id]); res.status(204).end() }
  catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.post("/soundcloud/admin/items", async (req, res) => {
  const { scope, artistId, kind, url, title, authorName, artworkUrl, sortOrder = 0, active = true } = req.body || {}
  if (!["lowradio", "partner"].includes(scope) || !["track", "playlist"].includes(kind) || !isSoundCloudUrl(url) || !title) return res.status(400).json({ message: "İçerik bilgileri geçersiz." })
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(`INSERT INTO soundcloud_items(scope,artist_id,kind,soundcloud_url,title,author_name,artwork_url,sort_order,active)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [scope, scope === "partner" ? artistId : null, kind, url, title, authorName || null, artworkUrl || null, sortOrder, active])
    res.status(201).json(result.rows[0])
  } catch (error) { res.status(error.code === "23505" ? 409 : 500).json({ message: error.code === "23505" ? "Bu içerik zaten ekli." : error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.patch("/soundcloud/admin/items/:id", async (req, res) => {
  const { sortOrder, active, title } = req.body || {}
  let db
  try { db = await getCustomDbConnection("lforadio"); const result = await db.query("UPDATE soundcloud_items SET sort_order=COALESCE($1,sort_order),active=COALESCE($2,active),title=COALESCE($3,title),updated_at=now() WHERE id=$4 RETURNING *", [sortOrder ?? null, active ?? null, title ?? null, req.params.id]); res.json(result.rows[0]) }
  catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

router.delete("/soundcloud/admin/items/:id", async (req, res) => {
  let db
  try { db = await getCustomDbConnection("lforadio"); await db.query("DELETE FROM soundcloud_items WHERE id=$1", [req.params.id]); res.status(204).end() }
  catch (error) { res.status(500).json({ message: error.message }) }
  finally { if (db) await db.end().catch(() => {}) }
})

export default router
