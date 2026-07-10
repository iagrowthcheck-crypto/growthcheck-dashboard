import { randomBytes } from 'node:crypto'
import { pool } from '@/lib/db'

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000 // 15 minutos

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS)
  await pool.query(
    'INSERT INTO magic_link_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
    [token, email, expiresAt]
  )
  return token
}

export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  const result = await pool.query<{ email: string }>(
    `UPDATE magic_link_tokens
     SET used_at = now()
     WHERE token = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING email`,
    [token]
  )
  return result.rows[0]?.email ?? null
}
