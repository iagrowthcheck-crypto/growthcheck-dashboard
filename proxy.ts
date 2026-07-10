import { NextRequest, NextResponse } from 'next/server'
import { verifySessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/session'
import { getSubscriberStatus } from '@/lib/subscribers'

export async function proxy(request: NextRequest) {
  const email = verifySessionCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  if (!email) {
    return NextResponse.redirect(new URL('/acceso', request.url))
  }

  const status = await getSubscriberStatus(email)
  if (status !== 'activo') {
    const pricingUrl = process.env.WIX_PRICING_URL
    if (pricingUrl) {
      return NextResponse.redirect(pricingUrl)
    }
    return NextResponse.redirect(new URL('/acceso?error=sin_suscripcion', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|acceso).*)'],
}
