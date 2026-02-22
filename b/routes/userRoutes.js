import express from "express"
import { register, login, getProfile, logout, refresh } from "../controllers/userController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()
router.post("/register", register)
router.post("/login", login)
router.post("/refresh", refresh)
router.get("/profile", authenticateJWT, getProfile)
router.post("/logout", logout)
export default router
