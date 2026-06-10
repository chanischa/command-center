'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function ConfirmInner() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const code = params.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.replace('/today')
      })
    } else {
      // Handle hash fragment for magic links
      const hash = window.location.hash
      if (hash) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) router.replace('/today')
          else router.replace('/auth')
        })
      } else {
        router.replace('/auth')
      }
    }
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans,sans-serif', color:'#787672', flexDirection:'column', gap:12 }}>
      <div style={{ width:32, height:32, background:'#37352F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', color:'#fff', fontSize:16 }}>K</div>
      <div>Signing you in...</div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans,sans-serif', color:'#787672' }}>
        Loading...
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  )
}
