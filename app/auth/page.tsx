'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>K</div>
        <h1 style={styles.title}>Command Center</h1>
        <p style={styles.sub}>Your personal productivity dashboard</p>

        <button onClick={signInWithGoogle} style={styles.googleBtn}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={styles.divider}><span>or</span></div>

        {sent ? (
          <div style={styles.sentMsg}>
            ✓ Check your email — we sent a magic link to <strong>{email}</strong>
          </div>
        ) : (
          <form onSubmit={signInWithEmail} style={styles.form}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', padding: '20px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,.08)' },
  logo: { width: '44px', height: '44px', background: '#37352F', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 600, marginBottom: '16px' },
  title: { fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 500, marginBottom: '6px' },
  sub: { fontSize: '13px', color: '#787672', marginBottom: '28px' },
  googleBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', border: '1px solid rgba(55,53,47,0.16)', borderRadius: '8px', background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '16px' },
  divider: { textAlign: 'center' as const, color: '#AEACAA', fontSize: '12px', margin: '4px 0 16px', position: 'relative' as const },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  input: { padding: '10px 12px', border: '1px solid rgba(55,53,47,0.16)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#F7F6F3' },
  submitBtn: { padding: '11px', background: '#37352F', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  sentMsg: { background: '#E1F5EE', color: '#0A4A37', padding: '14px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.6 },
}
