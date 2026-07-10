import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Pool } from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida.')
  process.exit(1)
}

const sql = readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=disable')
    ? false
    : { rejectUnauthorized: false },
})

try {
  await pool.query(sql)
  console.log('Migración aplicada correctamente.')
} finally {
  await pool.end()
}
