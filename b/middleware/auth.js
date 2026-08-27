import jwt from "jsonwebtoken"
import { getCustomDbConnection } from "../db.js"

function getAccessSecret() {
  const s = process.env.ACCESS_TOKEN_SECRET
  if (!s || s.trim() === "") throw new Error("ACCESS_TOKEN_SECRET tanımlı değil")
  return s.trim()
}

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token yok veya geçersiz" })
  }
  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, getAccessSecret())
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role || "listener" }
    next()
  } catch {
    return res.status(401).json({ message: "Token geçersiz" })
  }
}

export async function requireAdmin(req, res, next) {
  const configuredAdmin = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  const isConfiguredAdmin = configuredAdmin && req.user?.email?.toLowerCase() === configuredAdmin
  if (isConfiguredAdmin) return next()
  let db
  try {
    db = await getCustomDbConnection("lforadio")
    const result = await db.query("SELECT role FROM users WHERE id=$1", [req.user?.userId])
    if (result.rows[0]?.role === "admin") return next()
  } catch (error) {
    console.error("Admin yetkisi kontrol edilemedi:", error.message)
    return res.status(500).json({ message: "Yetki kontrolü yapılamadı." })
  } finally {
    if (db) await db.end().catch(() => {})
  }
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gerekli." })
  }
  return res.status(403).json({ message: "Yönetici yetkisi artık aktif değil." })
}
