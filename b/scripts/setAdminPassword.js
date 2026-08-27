import bcrypt from "bcrypt"
import { getCustomDbConnection } from "../db.js"

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!email || !password) {
  console.error("ADMIN_EMAIL ve ADMIN_PASSWORD zorunludur.")
  process.exit(1)
}

const db = await getCustomDbConnection("lforadio")
try {
  const hash = await bcrypt.hash(password, 10)
  const result = await db.query(
    `INSERT INTO users(email,username,password_hash,plan_id,role,created_at,updated_at)
     VALUES($1,$2,$3,1,'admin',now(),now())
     ON CONFLICT(email) DO UPDATE
       SET password_hash=EXCLUDED.password_hash,role='admin',updated_at=now()
     RETURNING id,email,username,role`,
    [email, "LOWRadio Admin", hash]
  )
  console.log(`Admin hesabı hazır: ${result.rows[0].email}`)
} finally {
  await db.end()
}
