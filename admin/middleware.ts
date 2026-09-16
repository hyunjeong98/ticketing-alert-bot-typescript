import { NextResponse } from 'next/server'
import { auth } from './auth'

export default auth((req) => {
  if (req.auth) return NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/login', req.url)
  return NextResponse.redirect(loginUrl)
})

export const config = {
  matcher: ['/((?!login|api/auth|_next|favicon.ico).*)'],
}
