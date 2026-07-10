import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/acceso', request.nextUrl.origin))
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}
