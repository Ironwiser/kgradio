import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
import { parseFile } from "music-metadata"
import userRoutes from "./routes/userRoutes.js"
const LFORADIO_ROOT = path.join(__dirname, "..")
const MUSIC_DIR = path.join(__dirname, "music")
const FRONTEND_DIST = path.join(__dirname, "..", "f", "dist")
const ANIMATION_DIR_PUBLIC = path.join(LFORADIO_ROOT, "f", "public", "animasyon")
const ANIMATION_DIR = fs.existsSync(path.join(FRONTEND_DIST, "animasyon"))
  ? path.join(FRONTEND_DIST, "animasyon")
  : ANIMATION_DIR_PUBLIC

const app = express()
const PORT = process.env.PORT || 3010

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use("/api", userRoutes)

/** Klasördeki .mp3 dosyalarını isme göre sıralı döner */
function getMp3List(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.toLowerCase().endsWith(".mp3"))
    .map((f) => ({ name: f.name, path: path.join(dir, f.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
}

/** b/music veya proje root'taki ilk .mp3 (sıralı) */
function getStreamPath() {
  const list = getMp3List(MUSIC_DIR)
  if (list.length > 0) return list[0].path
  const rootList = getMp3List(LFORADIO_ROOT)
  return rootList.length > 0 ? rootList[0].path : null
}

/** GET /api/audio/current — çalan parça bilgisi (stream ile aynı dosya) */
app.get("/api/audio/current", (req, res) => {
  const filePath = getStreamPath()
  if (!filePath) {
    return res.status(404).json({ error: "Parça bulunamadı.", name: null })
  }
  const filename = path.basename(filePath)
  const name = filename.replace(/\.mp3$/i, "")
  res.json({
    name,
    artworkUrl: `/api/audio/artwork/${encodeURIComponent(filename)}`,
  })
})

/** GET /api/audio/stream — tek MP3 stream (static/music veya proje root) */
app.get("/api/audio/stream", (req, res) => {
  const filePath = getStreamPath()
  if (!filePath) {
    return res.status(404).json({ error: "Hiç MP3 dosyası bulunamadı. lforadio/b/music veya proje köküne .mp3 koyun." })
  }
  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1
    const stream = fs.createReadStream(filePath, { start, end })
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    })
    stream.pipe(res)
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
    })
    fs.createReadStream(filePath).pipe(res)
  }
})

/** GET /api/audio/list — MP3 listesi (isim sıralı) */
app.get("/api/audio/list", (req, res) => {
  let list = getMp3List(MUSIC_DIR)
  if (list.length === 0) list = getMp3List(LFORADIO_ROOT)
  const items = list.map(({ name }) => ({
    name,
    displayName: name.replace(/\.mp3$/i, ""),
    url: `/api/audio/file/${encodeURIComponent(name)}`,
    artworkUrl: `/api/audio/artwork/${encodeURIComponent(name)}`,
  }))
  res.json(items)
})

/** GET /api/audio/artwork/:filename — MP3 içindeki kapak görseli (ID3 APIC) */
app.get("/api/audio/artwork/:filename", async (req, res) => {
  const filename = decodeURIComponent(req.params.filename)
  if (!filename.toLowerCase().endsWith(".mp3")) {
    return res.status(400).json({ error: "Sadece .mp3 desteklenir." })
  }
  const filePath = path.join(MUSIC_DIR, path.basename(filename))
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Dosya bulunamadı." })
  try {
    const metadata = await parseFile(filePath)
    const picture = metadata.common.picture?.[0]
    if (!picture?.data) return res.status(404).json({ error: "Bu parçada kapak görseli yok." })
    res.setHeader("Content-Type", picture.format || "image/jpeg")
    res.send(Buffer.from(picture.data))
  } catch (err) {
    console.error("Artwork parse hatası:", err.message)
    res.status(500).json({ error: "Kapak okunamadı." })
  }
})

/** GET /api/audio/file/:filename — belirli dosyayı stream et (b/music) */
app.get("/api/audio/file/:filename", (req, res) => {
  const filename = decodeURIComponent(req.params.filename)
  if (!filename.toLowerCase().endsWith(".mp3")) return res.status(400).json({ error: "Sadece .mp3 desteklenir." })
  const filePath = path.join(MUSIC_DIR, path.basename(filename))
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Dosya bulunamadı." })
  res.setHeader("Content-Type", "audio/mpeg")
  fs.createReadStream(filePath).pipe(res)
})

/** GET /api/animasyon/list — animasyon klasöründeki video dosyalarını isme göre sıralı döner (public veya dist) */
function getAnimationList() {
  const dir = ANIMATION_DIR
  if (!dir || !fs.existsSync(dir)) return []
  const ext = [".mp4", ".webm", ".mov"]
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((f) => f.isFile() && ext.some((e) => f.name.toLowerCase().endsWith(e)))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b, "tr"))
}
app.get("/api/animasyon/list", (req, res) => {
  const files = getAnimationList()
  res.json({ files })
})

/** Production: frontend build'ini sun (tek portta site + API) */
if (process.env.NODE_ENV === "production" && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST))
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"))
  })
}

app.listen(PORT, () => {
  const base = `http://localhost:${PORT}`
  console.log(`LFO Radio backend ${base}`)
  if (process.env.NODE_ENV === "production" && fs.existsSync(FRONTEND_DIST)) {
    console.log("Frontend (production) bu porttan sunuluyor.")
  }
  const p = getStreamPath()
  if (p) console.log("Stream dosyası:", path.basename(p))
  else console.log("Uyarı: Hiç MP3 bulunamadı. lforadio/b/music veya proje köküne .mp3 ekleyin.")
})
