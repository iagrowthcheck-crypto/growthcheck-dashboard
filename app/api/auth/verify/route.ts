import { NextRequest, NextResponse } from 'next/server'
import { consumeMagicLinkToken } from '@/lib/magicLink'
import { createSessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/acceso?error=token_faltante', baseUrl))
  }

  const email = await consumeMagicLinkToken(token)
  if (!email) {
    return NextResponse.redirect(new URL('/acceso?error=enlace_invalido', baseUrl))
  }

  const { value, maxAge } = createSessionCookieValue(email)
  const response = NextResponse.redirect(new URL('/', baseUrl))
  response.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
  return response
}