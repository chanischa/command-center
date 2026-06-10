import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/today'
  if (code) {
    return NextResponse.redirect(new URL(`/auth/confirm?code=${code}&next=${next}`, request.url))
  }
  return NextResponse.redirect(new URL('/auth', request.url))
}
