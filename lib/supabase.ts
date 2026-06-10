import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Use untyped client to avoid strict type inference issues
export function createClient() {
  return createClientComponentClient()
}
