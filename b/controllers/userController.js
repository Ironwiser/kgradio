import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { getCustomDbConnection } from "../db.js"

function getAccessSecret() {
  const s = process.env.ACCESS_TOKEN_SECRET
  if (!s || s.trim() === "") throw new Error("ACCESS_TOKEN_SECRET tanımlı değil")
  return s.trim()
}
function getRefreshSecret() {
  const s = process.env.REFRESH_TOKEN_SECRET
  if (!s || s.trim() === "") throw new Error("REFRESH_TOKEN_SECRET tanımlı değil")
  return s.trim()
}

export async function register(req, res) {
  const { email, username, password } = req.body || {}
  if (!email || !username || !password) {
    return res.status(400).json({ message: "E-posta, kullanıcı adı ve şifre zorunludur." })
  }
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const check = await db.query("SELECT id FROM users WHERE email = $1", [email])
    if (check.rows.length > 0) {
      await db.end()
      return res.status(409).json({ message: "Bu e-posta adresi zaten kayıtlı." })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const now = new Date()
    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, plan_id, created_at, updated_at)
       VALUES ($1, $2, $3, 1, $4, $5) RETURNING id, email, username`,
      [email, username, password_hash, now, now]
    )
    await db.end()
    return res.status(201).json({ message: "Hesabınız oluşturuldu.", user: result.rows[0] })
  } catch (err) {
    if (db) try { await db.end() } catch (_) {}
    const msg = (err && err.message) ? err.message : String(err)
    console.error("Register error:", msg)
    return res.status(500).json({ message: "Kayıt sırasında hata oluştu.", error: msg })
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: "E-posta ve şifre zorunludur." })
  }
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(
      "SELECT id, email, username, password_hash FROM users WHERE email = $1",
      [email]
    )
    await db.end()
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı." })
    }
    const user = result.rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı." })
    }
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      getAccessSecret(),
      { expiresIn: "15m" }
    )
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      getRefreshSecret(),
      { expiresIn: "30d" }
    )
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    return res.json({ accessToken, username: user.username })
  } catch (err) {
    if (db) try { await db.end() } catch (_) {}
    console.error("Login error:", err)
    return res.status(500).json({ message: "Giriş sırasında hata oluştu.", error: err.message })
  }
}

export async function getProfile(req, res) {
  if (!req.user?.email) {
    return res.status(401).json({ message: "Kullanıcı doğrulanamadı" })
  }
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query(
      "SELECT id, email, username FROM users WHERE email = $1",
      [req.user.email]
    )
    await db.end()
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" })
    }
    return res.json(result.rows[0])
  } catch (err) {
    if (db) try { await db.end() } catch (_) {}
    console.error("Profile error:", err)
    return res.status(500).json({ message: "Sunucu hatası.", error: err.message })
  }
}

export async function logout(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  return res.json({ message: "Çıkış başarılı" })
}

export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token bulunamadı" })
  }
  try {
    const decoded = jwt.verify(refreshToken, getRefreshSecret())
    let db
    try {
      db = await getCustomDbConnection("lforadio")
      const result = await db.query("SELECT id, email FROM users WHERE id = $1", [decoded.userId])
      await db.end()
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" })
      }
    } catch (e) {
      if (db) try { await db.end() } catch (_) {}
      throw e
    }
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      getAccessSecret(),
      { expiresIn: "1d" }
    )
    return res.json({ accessToken: newAccessToken })
  } catch (err) {
    console.error("Refresh token hatası:", err)
    return res.status(401).json({ message: "Geçersiz refresh token" })
  }
}
