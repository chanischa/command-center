export const dynamic = 'force-static'

export async function GET() {
  // Static redirect — actual code exchange handled client-side in /auth/confirm
  return new Response(null, {
    status: 302,
    headers: { Location: '/auth/confirm/' },
  })
}
