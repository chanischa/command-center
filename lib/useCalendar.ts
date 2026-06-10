'use client'
import { useState, useCallback } from 'react'

export interface CalEvent {
  summary: string
  startTime: string | null
  endTime: string | null
  loc: string
  allDay: boolean
  date: string
  isToday: boolean
}

const PROXIES = [
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
]

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), ms)
    fetch(url).then(r => { clearTimeout(t); res(r) }).catch(e => { clearTimeout(t); rej(e) })
  })
}

async function fetchIcal(url: string): Promise<string | null> {
  const https = url.replace(/^webcal:\/\//i, 'https://')
  for (const proxy of PROXIES) {
    try {
      const r = await fetchWithTimeout(proxy(https), 7000)
      if (!r.ok) continue
      const txt = await r.text()
      if (txt.trim().startsWith('{')) {
        const j = JSON.parse(txt)
        if (j.contents?.includes('VCALENDAR')) return j.contents
      }
      if (txt.includes('VCALENDAR')) return txt
    } catch { continue }
  }
  return null
}

function parseIcal(text: string): CalEvent[] {
  const events: CalEvent[] = []
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  text.split('BEGIN:VEVENT').slice(1).forEach(b => {
    const gv = (k: string) => { const m = b.match(new RegExp(k + '[^:]*:([^\\r\\n]+)')); return m ? m[1].trim() : '' }
    const ds = gv('DTSTART'), de = gv('DTEND'), summary = gv('SUMMARY') || 'Event', loc = gv('LOCATION')
    if (!ds) return
    const pt = (d: string) => {
      if (!d.includes('T')) return null
      const tp = d.replace(/.*T/, '').replace('Z', '')
      const h = parseInt(tp.slice(0, 2)), mn = parseInt(tp.slice(2, 4))
      if (d.endsWith('Z')) { const u = new Date(); u.setUTCHours(h, mn, 0, 0); return String(u.getHours()).padStart(2, '0') + ':' + String(u.getMinutes()).padStart(2, '0') }
      return String(h).padStart(2, '0') + ':' + String(mn).padStart(2, '0')
    }
    events.push({ summary, startTime: pt(ds), endTime: pt(de), loc, allDay: !ds.includes('T'), date: ds.replace(/T.*/, ''), isToday: ds.replace(/T.*/, '') === todayStr })
  })
  return events.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
}

export function useCalendar(calendarUrl: string | null | undefined) {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'synced' | 'error'>('idle')

  const sync = useCallback(async () => {
    if (!calendarUrl) { setStatus('error'); return }
    setStatus('loading')
    const ical = await fetchIcal(calendarUrl)
    if (ical) {
      setEvents(parseIcal(ical))
      setStatus('synced')
    } else {
      setStatus('error')
    }
  }, [calendarUrl])

  return { events, status, sync, todayEvents: events.filter(e => e.isToday) }
}
