import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE_NAME = 'gc_session'
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 días

function getSecret(): string {
  const secret = process.env.APP_SECRET
  if (!secret) throw new Error('APP_SECRET no está definida.')
  return secret
}

function sign(value: string, purpose: string): string {
  return createHmac('sha256', getSecret()).update(`${purpose}:${value}`).digest('hex')
}

export function createSessionCookieValue(email: string): { value: string; maxAge: number } {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url')
  const signature = sign(payload, 'session')
  return { value: `${payload}.${signature}`, maxAge: SESSION_MAX_AGE_SECONDS }
}

export function verifySessionCookieValue(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null
  const [payload, signature] = cookieValue.split('.')
  if (!payload || !signature) return null

  const expectedSignature = sign(payload, 'session')
  const a = Buffer.from(signature)
  const b = Buffer.from(expectedSignature)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof email !== 'string' || typeof exp !== 'number') return null
    if (Date.now() > exp) return null
    return email
  } catch {
    return null
  }
}
