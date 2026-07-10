import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriberStatus } from '@/lib/subscribers'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EVENT_TO_STATUS = {
  activated: 'activo',
  cancelled: 'inactivo',
  payment_failed: 'inactivo',
} as const

function isValidSecret(received: unknown): boolean {
  const expected = process.env.WIX_WEBHOOK_SECRET
  if (!expected || typeof received !== 'string' || !received) return false

  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function syncTokensBackend(email: string, event: string) {
  const secret = process.env.WEBHOOK_SECRET_BACKEND
  if (!secret) {
    console.error('WEBHOOK_SECRET_BACKEND no está definida, no se sincronizó el backend de tokens')
    return
  }

  const baseUrl = process.env.TOKENS_BACKEND_URL ?? 'https://web-production-333dd.up.railway.app'
  try {
    const res = await fetch(`${baseUrl}/cliente/suscripcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, event, secret }),
    })
    if (!res.ok) {
      console.error('Fallo al sincronizar tokens con el backend:', res.status, await res.text())
    }
  } catch (error) {
    console.error('Error de red al sincronizar tokens con el backend:', error)
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const { email, event, secret } = (body ?? {}) as {
    email?: unknown
    event?: unknown
    secret?: unknown
  }

  if (!isValidSecret(secret)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  if (typeof event !== 'string' || !(event in EVENT_TO_STATUS)) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 })
  }

  await upsertSubscriberStatus(email, EVENT_TO_STATUS[event as keyof typeof EVENT_TO_STATUS])
  await syncTokensBackend(email, event)

  return NextResponse.json({ ok: true })
}
