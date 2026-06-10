'use client'
import { useEffect } from 'react'
import { useSettings } from '@/lib/useSettings'
import { useCalendar } from '@/lib/useCalendar'
import type { CalEvent } from '@/lib/useCalendar'

const SCHED_BLOCKS = [
  {t:'06:00',e:'06:30',ti:'Wake · coffee · review',cls:'locked'},
  {t:'06:30',e:'07:00',ti:'Deep work — best brain',sub:'Code, strategy, writing',cls:'teal'},
  {t:'07:00',e:'07:30',ti:'Get ready · leave 07:25',cls:'locked'},
  {t:'07:30',e:'08:00',ti:'Commute → inbox zero',sub:'LINE, email',cls:'amber'},
  {t:'08:00',e:'08:30',ti:'Plan today',sub:'1 goal per venture',cls:'amber'},
  {t:'08:30',e:'12:00',ti:'Day job',sub:'Protected.',cls:'work'},
  {t:'12:00',e:'13:00',ti:'Lunch — 30 min session',sub:'Posts, approvals',cls:'amber'},
  {t:'13:00',e:'17:30',ti:'Day job continues',cls:'work'},
  {t:'17:30',e:'18:00',ti:'Commute home',sub:'Voice-note ideas',cls:'amber'},
  {t:'18:00',e:'18:30',ti:'Podcast · audio learning',cls:'amber'},
  {t:'18:30',e:'19:00',ti:'Dinner + reset',cls:'teal'},
  {t:'19:00',e:'20:30',ti:'Primary venture sprint',sub:'Mon=Veranin · Tue=QuizMe · Wed=RUNRUN · Thu=YOO',cls:'venture'},
  {t:'20:30',e:'21:15',ti:'Secondary venture',sub:'Content, admin',cls:'purple'},
  {t:'21:15',e:'21:30',ti:'Daily review',cls:'teal'},
  {t:'21:30',e:'23:00',ti:'Wind down · no screens',cls:'recovery'},
  {t:'23:00',e:'24:00',ti:'Sleep — 7h minimum',cls:'locked'},
]

const CLS_STYLES: Record<string, React.CSSProperties> = {
  locked:   { background:'#F5F4F2', color:'#787672', borderLeft:'3px solid #C8C6C2' },
  work:     { background:'#E6F1FB', color:'#0C3E6F', borderLeft:'3px solid #185FA5' },
  amber:    { background:'#FBF0E0', color:'#7A4A10', borderLeft:'3px solid #C17B2A' },
  teal:     { background:'#E1F5EE', color:'#0A4A37', borderLeft:'3px solid #0F6E56' },
  venture:  { background:'#E1F5EE', color:'#0A4A37', borderLeft:'3px solid #0F6E56' },
  purple:   { background:'#EEEDFE', color:'#3A308A', borderLeft:'3px solid #534AB7' },
  recovery: { background:'#FBEAF0', color:'#72243E', borderLeft:'3px solid #D4537E' },
}

function t2m(t: string) { const [h,m] = t.split(':').map(Number); return h*60+(m||0) }
function m2t(m: number) { return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}` }

const HOURS = Array.from({length:18},(_,i)=>i+6)
const PXH = 64

export default function SchedulePage() {
  const { settings } = useSettings()
  const { events, status, sync } = useCalendar(settings?.calendar_url)

  useEffect(() => { if (settings?.calendar_url) sync() }, [settings?.calendar_url])

  const now = new Date()
  const nowMin = now.getHours()*60+now.getMinutes()
  const startH = 6
  const todayEvents = events.filter(e => e.isToday && !e.allDay)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(55,53,47,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500 }}>Day schedule</span>
        <button onClick={sync} style={{ fontSize: 12, padding: '5px 12px', border: '1px solid rgba(55,53,47,0.16)', borderRadius: 20, background: 'transparent', cursor: 'pointer', color: status === 'synced' ? '#0A4A37' : '#787672' }}>
          {status === 'loading' ? 'Syncing...' : status === 'synced' ? '☁ Synced' : '↻ Sync calendar'}
        </button>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '8px 24px 40px' }}>
        {/* Hour grid */}
        {HOURS.map(h => (
          <div key={h} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', minHeight: PXH }}>
            <div style={{ fontSize: 11, color: '#AEACAA', paddingTop: 0, transform: 'translateY(-7px)', fontVariantNumeric: 'tabular-nums' }}>{String(h).padStart(2,'0')}:00</div>
            <div style={{ borderTop: '1px solid rgba(55,53,47,0.09)' }}></div>
          </div>
        ))}

        {/* Blocks overlay */}
        <div style={{ position: 'absolute', left: 76, right: 24, top: 8 }}>
          {SCHED_BLOCKS.map((b, i) => {
            const s = t2m(b.t), e = t2m(b.e)
            const top = (s - startH*60)/60*PXH
            const height = Math.max((e-s)/60*PXH - 2, 20)
            const hasApple = todayEvents.some(ev => { const es=t2m(ev.startTime||'0:0'),ee=t2m(ev.endTime||m2t(t2m(ev.startTime||'0:0')+60)); return es<e&&ee>s })
            return (
              <div key={i} style={{ position: 'absolute', top, height, left: 0, right: hasApple ? '50%' : 0, ...CLS_STYLES[b.cls], borderRadius: '0 6px 6px 0', padding: '4px 10px', overflow: 'hidden', fontSize: 12 }}>
                <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.ti}</div>
                {height > 32 && b.sub && <div style={{ fontSize: 10, opacity: .7, marginTop: 1 }}>{b.sub}</div>}
              </div>
            )
          })}

          {/* Apple Calendar events */}
          {todayEvents.map((ev, i) => {
            const s = t2m(ev.startTime||'0:0')
            const e = t2m(ev.endTime||m2t(s+60))
            if (s < startH*60) return null
            const top = (s - startH*60)/60*PXH
            const height = Math.max((e-s)/60*PXH - 2, 22)
            return (
              <div key={i} style={{ position: 'absolute', top, height, left: '50%', right: 0, background:'#FBEAF0', borderLeft:'3px solid #D4537E', color:'#72243E', borderRadius:'0 6px 6px 0', padding:'4px 10px', overflow:'hidden', fontSize:12 }}>
                <div style={{ fontWeight: 500, fontSize: 11 }}>🍎 {ev.summary}</div>
                <div style={{ fontSize: 10, opacity: .8 }}>{ev.startTime}{ev.endTime ? '–'+ev.endTime : ''}</div>
              </div>
            )
          })}

          {/* Now line */}
          {nowMin >= startH*60 && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: (nowMin-startH*60)/60*PXH, borderTop: '2px solid #A32D2D', zIndex: 8, pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', left: -52, top: -9, fontSize: 10, fontWeight: 600, color: '#A32D2D', background: '#fff', padding: '0 3px' }}>now</span>
              <span style={{ position: 'absolute', left: 0, top: -5, width: 9, height: 9, borderRadius: '50%', background: '#A32D2D', display: 'block' }}></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
