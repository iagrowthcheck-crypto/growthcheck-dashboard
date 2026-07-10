import { pool } from '@/lib/db'

export type SubscriberStatus = 'activo' | 'inactivo'

export async function getSubscriberStatus(email: string): Promise<SubscriberStatus | null> {
  const result = await pool.query<{ status: SubscriberStatus }>(
    'SELECT status FROM subscribers WHERE email = $1',
    [email.toLowerCase()]
  )
  return result.rows[0]?.status ?? null
}

export async function upsertSubscriberStatus(email: string, status: SubscriberStatus): Promise<void> {
  await pool.query(
    `INSERT INTO subscribers (email, status, wix_event_at, updated_at)
     VALUES ($1, $2, now(), now())
     ON CONFLICT (email)
     DO UPDATE SET status = $2, wix_event_at = now(), updated_at = now()`,
    [email.toLowerCase(), status]
  )
}
