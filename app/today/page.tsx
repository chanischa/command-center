'use client'
import { useEffect } from 'react'
import { useTasks } from '@/lib/useTasks'
import { useGoals } from '@/lib/useGoals'
import { useSettings } from '@/lib/useSettings'
import { useCalendar } from '@/lib/useCalendar'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const VH: Record<string,string> = { Veranin:'#C17B2A', QuizMe:'#185FA5', RUNRUN:'#A32D2D', 'YOO Home':'#534AB7', Personal:'#0F6E56' }
const VC: Record<string,string> = { Veranin:'amber', QuizMe:'blue', RUNRUN:'red', 'YOO Home':'purple', Personal:'teal' }

const FOCUS_BLOCKS = [
  { s:360, e:420, t:'Deep work window', sub:'Best brain. Code, strategy, writing.' },
  { s:450, e:510, t:'Commute — inbox + planning', sub:'Mobile tasks. Clear backlog.' },
  { s:720, e:780, t:'Lunch micro-session', sub:'30 min: quick approvals.' },
  { s:1050,e:1110,t:'Commute home — decompress', sub:'Voice-note ideas.' },
  { s:1140,e:1260,t:'Dinner + reset', sub:'Before venture sprint.' },
  { s:1260,e:1350,t:'Primary venture sprint', sub:'Mon=Veranin · Tue=QuizMe · Wed=RUNRUN · Thu=YOO Home' },
  { s:1350,e:1395,t:'Secondary tasks', sub:'Content, admin, quick decisions.' },
  { s:1395,e:1410,t:'Daily review', sub:'Update tasks. Set tomorrow goal.' },
]

export default function TodayPage() {
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const hr = now.getHours()
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = `${DAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  const fb = FOCUS_BLOCKS.find(b => nowMin >= b.s && nowMin < b.e) ||
    FOCUS_BLOCKS[FOCUS_BLOCKS.findIndex(b => nowMin < b.s) >= 0 ? FOCUS_BLOCKS.findIndex(b => nowMin < b.s) : FOCUS_BLOCKS.length - 1]

  const { tasks, toggleTask } = useTasks()
  const { goals, toggleMilestone } = useGoals()
  const { settings } = useSettings()
  const { todayEvents, status, sync } = useCalendar(settings?.calendar_url)

  useEffect(() => { if (settings?.calendar_url) sync() }, [settings?.calendar_url])

  const activeTasks = tasks.filter(t => !t.done).slice(0, 6)
  const doneCount = tasks.filter(t => t.done).length
  const activeGoals = goals.filter(g => g.progress < 100).slice(0, 3)
  const ventures = ['Veranin', 'QuizMe', 'RUNRUN', 'YOO Home']
  const progress = settings?.venture_progress || {}
  const C = 2 * Math.PI * 18

  return (
    <div style={{ padding: '24px 32px 0' }}>
      {/* Header */}
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 500, lineHeight: 1.1 }}>
        {greeting}, K
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 6 }}>{dateStr}</p>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, marginBottom: 20 }}>
        <span className="chip">{todayEvents.length} events</span>
        <span className="chip">{doneCount} done</span>
        <span className="chip">5h side time</span>
        <span
          className="chip"
          onClick={sync}
          style={{ cursor: 'pointer', background: status === 'synced' ? 'var(--teal-bg)' : status === 'error' ? 'var(--red-bg)' : 'var(--bg2)', color: status === 'synced' ? 'var(--teal-dark)' : status === 'error' ? 'var(--red-dark)' : 'var(--text2)' }}
        >
          {status === 'loading' ? '⟳ Syncing...' : status === 'synced' ? '☁ Synced' : status === 'error' ? '✗ Calendar offline' : '↻ Sync calendar'}
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, borderTop: '1px solid var(--border)', minHeight: 'calc(100vh - 220px)' }}>

        {/* Left: Focus + Calendar */}
        <div style={{ borderRight: '1px solid var(--border)', padding: '20px 24px' }}>
          {/* Focus block */}
          <div style={{ background: 'linear-gradient(135deg,#37352F,#46433C)', color: '#fff', borderRadius: 12, padding: 22, marginBottom: 24 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', opacity: .6, marginBottom: 6 }}>Focus now</div>
            <div style={{ fontSize: 13, opacity: .85, marginBottom: 4, fontWeight: 500 }}>
              {Math.floor(fb.s/60).toString().padStart(2,'0')}:{(fb.s%60||0).toString().padStart(2,'0')} – {Math.floor(fb.e/60).toString().padStart(2,'0')}:{(fb.e%60||0).toString().padStart(2,'0')}
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 500 }}>{fb.t}</div>
            <div style={{ fontSize: 13, opacity: .7, marginTop: 6 }}>{fb.sub}</div>
          </div>

          {/* Today's calendar events */}
          <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)' }}>Calendar today</div>
          {todayEvents.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No events — free day!</p>
            : todayEvents.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', width: 52, fontVariantNumeric: 'tabular-nums' }}>{ev.allDay ? 'All day' : ev.startTime}</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pink)', flexShrink: 0 }}></span>
                <span>{ev.summary}</span>
              </div>
            ))
          }
        </div>

        {/* Right: Tasks + Rings + Goals */}
        <div style={{ padding: '20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tasks */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 8 }}>Tasks</div>
            {activeTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => toggleTask(t.id)}>
                <div style={{ width: 16, height: 16, border: '1.5px solid var(--border2)', borderRadius: 4, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? 'var(--text)' : 'transparent', borderColor: t.done ? 'var(--text)' : undefined }}>
                  {t.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{t.title}</div>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `var(--${VC[t.venture] || 'gray'}-bg)`, color: `var(--${VC[t.venture] || 'gray'}-dark)` }}>{t.venture}</span>
                </div>
              </div>
            ))}
            {doneCount > 0 && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>+ {doneCount} completed</p>}
          </div>

          {/* Venture rings */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 10 }}>Venture progress</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ventures.map(v => {
                const p = progress[v] || 0
                const off = C * (1 - p / 100)
                const hex = VH[v]
                return (
                  <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <svg viewBox="0 0 44 44" width="52" height="52">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#F1EFE8" strokeWidth="4"/>
                      <circle cx="22" cy="22" r="18" fill="none" stroke={hex} strokeWidth="4" strokeLinecap="round" strokeDasharray={C.toFixed(1)} strokeDashoffset={off.toFixed(1)} transform="rotate(-90 22 22)"/>
                      <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="500" fill={hex} fontFamily="DM Sans">{p}%</text>
                    </svg>
                    <span style={{ fontSize: 10, color: 'var(--text2)', textAlign: 'center' }}>{v}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active goals */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 8 }}>Goals</div>
            {activeGoals.map(g => (
              <div key={g.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{g.title}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>{g.progress}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 3, background: VH[g.venture] || '#888', width: `${g.progress}%`, borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`.chip { display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;font-size:12px;background:var(--bg2);color:var(--text2);border:1px solid var(--border); }`}</style>
    </div>
  )
}
