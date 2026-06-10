'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV = [
  { path: '/today',    label: 'Today',    icon: HomeIcon },
  { path: '/tasks',    label: 'Tasks',    icon: TaskIcon },
  { path: '/goals',    label: 'Goals',    icon: TargetIcon },
  { path: '/schedule', label: 'Schedule', icon: ClockIcon },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Icon rail */}
      <nav style={{ width: 56, background: '#F7F6F3', borderRight: '1px solid rgba(55,53,47,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', flexShrink: 0, gap: 2, zIndex: 30 }}>
        <div onClick={() => setDrawerOpen(!drawerOpen)} style={{ width: 34, height: 34, background: '#37352F', color: '#fff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, marginBottom: 10, cursor: 'pointer' }}>K</div>
        {NAV.map(item => (
          <RailBtn key={item.path} label={item.label} active={pathname === item.path} Icon={item.icon} onClick={() => { router.push(item.path); setDrawerOpen(false) }} />
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={signOut} title="Sign out" style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AEACAA', fontSize: 18 }}>
          <SignOutIcon />
        </button>
      </nav>

      {/* Scrim */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 24 }} />}

      {/* Nav drawer */}
      <aside style={{ position: 'fixed', left: 56, top: 0, bottom: 0, width: 230, background: '#fff', borderRight: '1px solid rgba(55,53,47,0.09)', zIndex: 25, boxShadow: '4px 0 16px rgba(0,0,0,.08)', transform: drawerOpen ? 'translateX(0)' : 'translateX(-110%)', transition: 'transform .2s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid rgba(55,53,47,0.09)' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>K's Workspace</div>
          <div style={{ fontSize: 11, color: '#AEACAA', marginTop: 3 }}>Personal dashboard</div>
        </div>
        <div style={{ padding: 8, flex: 1 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#AEACAA', padding: '8px 8px 4px', fontWeight: 500 }}>Pages</div>
          {NAV.map(item => (
            <div key={item.path} onClick={() => { router.push(item.path); setDrawerOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: pathname === item.path ? '#37352F' : '#787672', background: pathname === item.path ? '#F7F6F3' : 'transparent', fontWeight: pathname === item.path ? 500 : 400 }}>
              <item.icon size={16} /> {item.label}
            </div>
          ))}
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#AEACAA', padding: '12px 8px 4px', fontWeight: 500 }}>Ventures</div>
          {[['Veranin','#C17B2A'],['QuizMe','#185FA5'],['RUNRUN','#A32D2D'],['YOO Home','#534AB7']].map(([name, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 12, color: '#787672', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}></span>{name}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 12, color: '#AEACAA', opacity: .4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9A9690', flexShrink: 0 }}></span>Havendoor (hold)
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 48, background: '#fff', borderBottom: '1px solid rgba(55,53,47,0.09)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ width: 30, height: 30, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#787672' }}>
            <MenuIcon />
          </button>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{NAV.find(n => n.path === pathname)?.label || 'Command'}</span>
        </div>
        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav style={{ display: 'none' }} className="mobile-nav" aria-label="Mobile navigation">
        {NAV.map(item => (
          <button key={item.path} onClick={() => router.push(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer', color: pathname === item.path ? '#37352F' : '#AEACAA', fontSize: 9, fontFamily: 'inherit', padding: '6px 0' }}>
            <item.icon size={22} />
            {item.label}
          </button>
        ))}
      </nav>

      <style>{`
        @media(max-width:768px){
          nav[aria-label="Mobile navigation"]{ display:flex!important; position:fixed; bottom:0; left:0; right:0; height:54px; background:#fff; border-top:1px solid rgba(55,53,47,0.09); z-index:100; }
          main > div { padding-bottom: 54px; }
        }
      `}</style>
    </div>
  )
}

function RailBtn({ label, active, Icon, onClick }: { label: string, active: boolean, Icon: React.FC<{size?:number}>, onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} style={{ width: 40, height: 40, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#fff' : '#787672', cursor: 'pointer', border: 'none', background: active ? '#37352F' : 'transparent', position: 'relative', transition: 'all .12s' }}>
      <Icon size={20} />
    </button>
  )
}

// SVG Icons
function HomeIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18v-9"/></svg>
}
function TaskIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="16" height="16" rx="2"/><path d="m7 13 3 3 7-7"/></svg>
}
function TargetIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
}
function ClockIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
}
function MenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
}
function SignOutIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
