import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

// Browser client — use in Client Components ('use client')
export function createClient() {
  return createClientComponentClient<Database>()
}
