import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Use untyped client to avoid strict type inference issues
export function createClient() {
  // Fallback for build time when env vars may not be set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (typeof window === 'undefined') return null as any
  }
  return createClientComponentClient()
}
