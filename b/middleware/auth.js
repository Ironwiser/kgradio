import jwt from "jsonwebtoken"

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
    req.user = { userId: decoded.userId, email: decoded.email }
    next()
  } catch {
    return res.status(401).json({ message: "Token geçersiz" })
  }
}
