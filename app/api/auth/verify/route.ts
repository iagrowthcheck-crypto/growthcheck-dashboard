import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSubscriberStatus } from '@/lib/subscribers'
import { createMagicLinkToken } from '@/lib/magicLink'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GENERIC_RESPONSE = {
  ok: true,
  message: 'Si tu correo tiene una suscripción activa, te enviamos un enlace de acceso.',
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const { email } = (body ?? {}) as { email?: unknown }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase()
  const status = await getSubscriberStatus(normalizedEmail)

  // Respuesta idéntica exista o no el correo, y esté activo o no,
  // para no revelar qué correos tienen suscripción.
  if (status !== 'activo') {
    return NextResponse.json(GENERIC_RESPONSE)
  }

  const token = await createMagicLinkToken(normalizedEmail)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const verifyUrl = new URL('/api/auth/verify', baseUrl)
  verifyUrl.searchParams.set('token', token)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'contacto@growthcheck.ink',
    to: normalizedEmail,
    subject: 'Tu acceso a GrowthCheck',
    html: `
      <p>Haz clic en el siguiente enlace para acceder a tu dashboard de GrowthCheck:</p>
      <p><a href="${verifyUrl.toString()}">${verifyUrl.toString()}</a></p>
      <p>Este enlace expira en 15 minutos y solo puede usarse una vez.</p>
    `,
  })

  if (error) {
    console.error('Resend send error:', error)
    return NextResponse.json(
      { ok: false, error: 'send_failed', message: 'No pudimos enviar el correo. Intenta de nuevo en unos minutos.' },
      { status: 502 }
    )
  }

  return NextResponse.json(GENERIC_RESPONSE)
}