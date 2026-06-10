'use client'
import { useState } from 'react'
import { useTasks } from '@/lib/useTasks'
import type { Task, TimeWindow, Venture, Priority } from '@/types/database'

const VC: Record<string,string> = { Veranin:'amber', QuizMe:'blue', RUNRUN:'red', 'YOO Home':'purple', Personal:'teal' }
const WIN_LABEL: Record<TimeWindow, string> = { commute:'Commute', lunch:'Lunch', evening:'Evening' }
const SUBTIMES: Record<TimeWindow, string[]> = {
  commute: ['Morning commute (07:30)','Morning commute (08:00)','Evening commute (17:30)','Evening commute (18:00)'],
  lunch:   ['Lunch (12:00–12:30)','Lunch (12:30–13:00)'],
  evening: ['Dinner reset (18:30)','Deep sprint (19:00–20:30)','Secondary sprint (20:30–21:15)','Review (21:15–21:30)'],
}
const ALL_TAGS = ['urgent','quick','deep','waiting','client','content','admin','review']
const TAG_COLORS: Record<string,string> = { urgent:'pink', quick:'green', deep:'orange', waiting:'sky', client:'amber', content:'teal', admin:'purple', review:'gray' }

export default function TasksPage() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks()
  const [filter, setFilter] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', venture:'Veranin' as Venture, win:'evening' as TimeWindow, subtime:'Deep sprint (19:00–20:30)', tags:[] as string[], priority:'medium' as Priority, due_date:'', notes:'' })

  const active = tasks.filter(t => !t.done).filter(t => {
    if (filter === 'all') return true
    if (['commute','lunch','evening'].includes(filter)) return t.win === filter
    return t.venture === filter
  })
  const done = tasks.filter(t => t.done)

  const grouped: Record<string, Task[]> = {}
  active.forEach(t => { const k = WIN_LABEL[t.win]; (grouped[k] = grouped[k] || []).push(t) })

  function toggleTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await addTask({ ...form, done: false })
    setForm({ title:'', venture:'Veranin', win:'evening', subtime:'Deep sprint (19:00–20:30)', tags:[], priority:'medium', due_date:'', notes:'' })
    setShowModal(false)
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text3)' }}>Loading tasks...</div>

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500 }}>Tasks</h1>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>+ New task</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {['all','commute','lunch','evening','Veranin','QuizMe','RUNRUN','YOO Home'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: filter === f ? 'var(--text)' : 'transparent', color: filter === f ? '#fff' : 'var(--text2)', cursor: 'pointer' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Task groups */}
      {Object.entries(grouped).map(([group, ts]) => (
        <div key={group}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', padding: '12px 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {group} <span style={{ flex: 1, height: 1, background: 'var(--border)' }}></span>
          </div>
          {ts.map(t => <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />)}
        </div>
      ))}

      {active.length === 0 && <p style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0' }}>No tasks — you're all caught up 🎉</p>}

      {/* Completed */}
      {done.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setShowDone(!showDone)} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
            <span>{showDone ? '▾' : '▸'}</span> Completed ({done.length})
          </button>
          {showDone && done.map(t => <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} dimmed />)}
        </div>
      )}

      {/* Quick add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, marginTop: 16, background: 'var(--bg2)' }}>
        <span style={{ color: 'var(--text3)', fontSize: 16 }}>+</span>
        <input placeholder="Quick add task... (Enter)" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none' }}
          onKeyDown={async e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value.trim(); if (v) { await addTask({ title: v, venture: 'Personal', win: 'evening', subtime: 'Deep sprint (19:00–20:30)', tags: [], priority: 'medium', due_date: null, notes: '', done: false }); (e.target as HTMLInputElement).value = '' } } }} />
        <button onClick={() => setShowModal(true)} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer' }}>Full editor</button>
      </div>

      {/* Add task modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,15,.45)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 20px' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <form onSubmit={handleAdd} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560, boxShadow: '0 12px 40px rgba(0,0,0,.14)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 10px' }}>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Task name..." style={{ width: '100%', fontFamily: 'Cormorant Garamond, serif', fontSize: 24, border: 'none', outline: 'none', background: 'transparent' }} autoFocus />
            </div>
            <div style={{ padding: '0 24px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Venture */}
              <div style={propRow}><span style={propLabel}>Venture</span><select value={form.venture} onChange={e => setForm(f => ({...f, venture: e.target.value as Venture}))} style={propSel}><option>Veranin</option><option>QuizMe</option><option>RUNRUN</option><option>YOO Home</option><option>Personal</option></select></div>
              {/* Window */}
              <div style={propRow}><span style={propLabel}>Window</span><div style={{ display: 'flex', gap: 6 }}>{(['commute','lunch','evening'] as TimeWindow[]).map(w => <button key={w} type="button" onClick={() => { setForm(f => ({...f, win: w, subtime: SUBTIMES[w][0]})) }} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: form.win === w ? 'var(--text)' : 'transparent', color: form.win === w ? '#fff' : 'var(--text2)', cursor: 'pointer' }}>{w}</button>)}</div></div>
              {/* Sub-time */}
              <div style={propRow}><span style={propLabel}>Sub-time</span><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{SUBTIMES[form.win].map(s => <button key={s} type="button" onClick={() => setForm(f => ({...f, subtime: s}))} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, border: '1px solid var(--border)', background: form.subtime === s ? 'var(--bg2)' : 'transparent', color: form.subtime === s ? 'var(--text)' : 'var(--text3)', cursor: 'pointer' }}>{s}</button>)}</div></div>
              {/* Tags */}
              <div style={propRow}><span style={propLabel}>Tags</span><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{ALL_TAGS.map(tag => <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, border: form.tags.includes(tag) ? '1.5px solid currentColor' : '1px solid var(--border)', background: `var(--${TAG_COLORS[tag]}-bg)`, color: `var(--${TAG_COLORS[tag]}-dark)`, cursor: 'pointer' }}>{tag}</button>)}</div></div>
              {/* Priority */}
              <div style={propRow}><span style={propLabel}>Priority</span><div style={{ display: 'flex', gap: 6 }}>{(['low','medium','high'] as Priority[]).map(p => <button key={p} type="button" onClick={() => setForm(f => ({...f, priority: p}))} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: form.priority === p ? 'var(--text)' : 'transparent', color: form.priority === p ? '#fff' : 'var(--text2)', cursor: 'pointer' }}>{p === 'high' ? '🔴 High' : p}</button>)}</div></div>
              {/* Due */}
              <div style={propRow}><span style={propLabel}>Due</span><input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} style={{ fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }}/></div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '10px 24px 0' }}>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notes, context, links..." rows={3} style={{ width: '100%', fontSize: 13, border: 'none', background: 'transparent', outline: 'none', resize: 'none', color: 'var(--text2)', lineHeight: 1.6 }} />
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '7px 14px', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete, dimmed }: { task: Task, onToggle: ()=>void, onDelete: ()=>void, dimmed?: boolean }) {
  const vc = VC[task.venture] || 'gray'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 7, cursor: 'pointer', opacity: dimmed ? 0.55 : 1, transition: 'background .1s' }} onMouseOver={e => (e.currentTarget.style.background='var(--bg-hover)')} onMouseOut={e => (e.currentTarget.style.background='transparent')}>
      <div onClick={onToggle} style={{ width: 17, height: 17, border: `1.5px solid ${task.done ? 'var(--text)' : 'var(--border2)'}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, background: task.done ? 'var(--text)' : 'transparent', cursor: 'pointer' }}>
        {task.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text3)' : 'var(--text)' }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 3 }}>
          {task.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `var(--${(TAG_COLORS as any)[t]||'gray'}-bg)`, color: `var(--${(TAG_COLORS as any)[t]||'gray'}-dark)` }}>{t}</span>)}
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `var(--${vc}-bg)`, color: `var(--${vc}-dark)` }}>{task.venture}</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{task.subtime}</span>
          {task.priority === 'high' && !task.done && <span style={{ fontSize: 10 }}>🔴</span>}
        </div>
      </div>
      <button onClick={onDelete} style={{ opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 16, color: 'var(--text3)', flexShrink: 0 }} title="Delete">×</button>
    </div>
  )
}

const propRow: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '6px 8px', borderRadius: 7 }
const propLabel: React.CSSProperties = { fontSize: 12, color: 'var(--text3)', width: 80, flexShrink: 0, paddingTop: 3 }
const propSel: React.CSSProperties = { border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer', outline: 'none' }
const btnPrimary: React.CSSProperties = { padding: '7px 16px', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer' }
