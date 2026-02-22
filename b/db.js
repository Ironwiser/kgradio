import pg from "pg"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

/** Auth için lforadio veritabanına bağlanır. DATABASE_URL doğrudan pg'ye verilir (şifre decode pg'de). */
export async function getCustomDbConnection(dbName = "lforadio") {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DB bilgisi yok. b/.env içinde DATABASE_URL tanımlayın.")
  const connectionString = dbName === "lforadio" ? url : url.replace(/\/[^/]*$/, "/" + dbName)
  const client = new pg.Client({ connectionString })
  await client.connect()
  return client
}
