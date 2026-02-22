import pg from "pg"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

/**
 * Bağlantı URL'ini döndürür.
 * - DATABASE_URL varsa onu kullanır (local .env).
 * - Yoksa DB_HOST, DB_USER, DB_PASSWORD, DB_NAME ile oluşturur (serverda şifre özel karakter içerebilir).
 */
function getConnectionString(dbName) {
  if (process.env.DATABASE_URL) {
    return dbName === "lforadio"
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL.replace(/\/[^/]*$/, "/" + dbName)
  }
  const host = process.env.DB_HOST || "localhost"
  const port = process.env.DB_PORT || "5432"
  const user = process.env.DB_USER || "postgres"
  const password = process.env.DB_PASSWORD
  const name = dbName || process.env.DB_NAME || "lforadio"
  if (!password) throw new Error("DB bilgisi yok. DATABASE_URL veya DB_PASSWORD (b/.env veya ortam) tanımlayın.")
  const encoded = encodeURIComponent(password)
  return `postgresql://${user}:${encoded}@${host}:${port}/${name}`
}

/** Auth için lforadio veritabanına bağlanır. */
export async function getCustomDbConnection(dbName = "lforadio") {
  const connectionString = getConnectionString(dbName)
  const client = new pg.Client({ connectionString })
  await client.connect()
  return client
}
