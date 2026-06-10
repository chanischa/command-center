'use client'
import { useState } from 'react'
import { useGoals } from '@/lib/useGoals'
import type { Goal, Venture, Horizon } from '@/types/database'

const VC: Record<string,string> = { Veranin:'amber', QuizMe:'blue', RUNRUN:'red', 'YOO Home':'purple', Personal:'teal' }
const VH: Record<string,string> = { Veranin:'#C17B2A', QuizMe:'#185FA5', RUNRUN:'#A32D2D', 'YOO Home':'#534AB7', Personal:'#0F6E56' }
const HORIZONS: { key: Horizon, label: string }[] = [{ key:'3month', label:'3-month' }, { key:'6month', label:'6-month' }, { key:'1year', label:'1-year' }, { key:'3year', label:'3-year' }]

export default function GoalsPage() {
  const { goals, loading, addGoal, toggleMilestone, deleteGoal } = useGoals()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', venture:'Veranin' as Venture, horizon:'6month' as Horizon, deadline:'', description:'' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await addGoal({ ...form, progress: 0, milestones: [] })
    setForm({ title:'', venture:'Veranin', horizon:'6month', deadline:'', description:'' })
    setShowModal(false)
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text3)' }}>Loading goals...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500 }}>Long-term goals</h1>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>+ New goal</button>
      </div>

      {HORIZONS.map(h => {
        const gs = goals.filter(g => g.horizon === h.key)
        if (!gs.length) return null
        return (
          <div key={h.key} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              {h.label} goals <span style={{ flex: 1, height: 1, background: 'var(--border)' }}></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 12 }}>
              {gs.map(g => <GoalCard key={g.id} goal={g} onToggleMilestone={(i) => toggleMilestone(g.id, i)} onDelete={() => deleteGoal(g.id)} />)}
            </div>
          </div>
        )
      })}

      {goals.length === 0 && <p style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0' }}>No goals yet — add your first long-term goal.</p>}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,15,.45)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 20px' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <form onSubmit={handleAdd} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, boxShadow: '0 12px 40px rgba(0,0,0,.14)' }}>
            <div style={{ padding: '22px 24px 10px' }}>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Goal title..." style={{ width: '100%', fontFamily: 'Cormorant Garamond, serif', fontSize: 24, border: 'none', outline: 'none', background: 'transparent' }} autoFocus />
            </div>
            <div style={{ padding: '0 24px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 80 }}>Venture</span>
                <select value={form.venture} onChange={e => setForm(f => ({...f, venture: e.target.value as Venture}))} style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                  {['Veranin','QuizMe','RUNRUN','YOO Home','Personal'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 80 }}>Horizon</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {HORIZONS.map(h => <button key={h.key} type="button" onClick={() => setForm(f => ({...f, horizon: h.key}))} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: form.horizon === h.key ? 'var(--text)' : 'transparent', color: form.horizon === h.key ? '#fff' : 'var(--text2)', cursor: 'pointer' }}>{h.label}</button>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 80 }}>Deadline</span>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} style={{ fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '10px 24px 0' }}>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe the goal, why it matters, how you'll measure success..." rows={4} style={{ width: '100%', fontSize: 13, border: 'none', background: 'transparent', outline: 'none', resize: 'none', color: 'var(--text2)', lineHeight: 1.6 }} />
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '7px 14px', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save goal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, onToggleMilestone, onDelete }: { goal: Goal, onToggleMilestone: (i: number) => void, onDelete: () => void }) {
  const vc = VC[goal.venture] || 'gray'
  const hex = VH[goal.venture] || '#888'
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: `var(--${vc}-bg)`, color: `var(--${vc}-dark)`, marginBottom: 8, display: 'inline-block' }}>{goal.venture}</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16, opacity: 0.6 }}>×</button>
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{goal.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 14 }}>{goal.description}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}><span>Progress</span><span>{goal.progress}%</span></div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: 4, borderRadius: 3, background: hex, width: `${goal.progress}%` }} />
      </div>
      {goal.milestones.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)', padding: '3px 0' }}>
          <div onClick={() => onToggleMilestone(i)} style={{ width: 14, height: 14, border: `1.5px solid ${m.done ? 'var(--text)' : 'var(--border2)'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: m.done ? 'var(--text)' : 'transparent' }}>
            {m.done && <span style={{ color: '#fff', fontSize: 8 }}>✓</span>}
          </div>
          <span style={{ textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--text3)' : 'inherit' }}>{m.text}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, display: 'flex', gap: 8 }}>
        <span>📅 {goal.deadline || 'No deadline'}</span>
        <span>·</span>
        <span>{goal.milestones.filter(m => m.done).length}/{goal.milestones.length} done</span>
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = { padding: '7px 16px', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer' }
