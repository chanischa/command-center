'use client'
import { useState } from 'react'
import { useGoals } from '@/lib/useGoals'
import type { Goal, Venture, Horizon } from '@/types/database'

const VH: Record<string,string> = { Veranin:'#C17B2A', QuizMe:'#185FA5', RUNRUN:'#A32D2D', 'YOO Home':'#534AB7', Personal:'#0F6E56' }
const VC: Record<string,string> = { Veranin:'amber', QuizMe:'blue', RUNRUN:'red', 'YOO Home':'purple', Personal:'teal' }

const GOAL_TEMPLATES = [
  { emoji:'💰', label:'Revenue target',   example:'10,000 THB/month from Veranin' },
  { emoji:'🤝', label:'Close a deal',     example:'First paying customer for QuizMe' },
  { emoji:'👥', label:'Get customers',    example:'10 active students on QuizMe' },
  { emoji:'📦', label:'Launch something', example:'RUNRUN first product batch' },
  { emoji:'📈', label:'Growth milestone', example:'100 YOO Home listings live' },
  { emoji:'🏆', label:'Personal win',     example:'Quit day job by Dec 2027' },
]

const HORIZONS: { key: Horizon; label: string; color: string }[] = [
  { key:'3month', label:'3 months', color:'#C17B2A' },
  { key:'6month', label:'6 months', color:'#185FA5' },
  { key:'1year',  label:'1 year',   color:'#0F6E56' },
  { key:'3year',  label:'3 years',  color:'#534AB7' },
]

type GoalStatus = 'not_started' | 'in_progress' | 'achieved'

function getStatus(g: Goal): GoalStatus {
  if (g.progress >= 100) return 'achieved'
  if (g.progress > 0) return 'in_progress'
  return 'not_started'
}

const STATUS_STYLE: Record<GoalStatus, { bg: string; color: string; label: string; dot: string }> = {
  not_started: { bg:'#F7F6F3', color:'#787672', label:'Not started', dot:'#AEACAA' },
  in_progress: { bg:'#FBF0E0', color:'#7A4A10', label:'In progress',  dot:'#C17B2A' },
  achieved:    { bg:'#E1F5EE', color:'#0A4A37', label:'Achieved! 🎉', dot:'#0F6E56' },
}

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', venture: 'Personal' as Venture, horizon: '6month' as Horizon,
    deadline: '', description: '', emoji: '🎯', current: 0, target: 0, unit: ''
  })
  const [editProgress, setEditProgress] = useState<string | null>(null)
  const [progressVal, setProgressVal] = useState(0)

  const grouped = HORIZONS.reduce<Record<Horizon, Goal[]>>((acc, h) => {
    acc[h.key] = goals.filter(g => g.horizon === h.key)
    return acc
  }, { '3month':[], '6month':[], '1year':[], '3year':[] })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const title = `${form.emoji} ${form.title}${form.target ? ` — target: ${form.target}${form.unit ? ' '+form.unit : ''}` : ''}`
    await addGoal({
      title, venture: form.venture, horizon: form.horizon,
      deadline: form.deadline, description: form.description,
      progress: 0, milestones: []
    })
    setForm({ title:'', venture:'Personal', horizon:'6month', deadline:'', description:'', emoji:'🎯', current:0, target:0, unit:'' })
    setShowModal(false)
  }

  async function handleProgressSave(id: string) {
    await updateGoal(id, { progress: Math.min(100, Math.max(0, progressVal)) })
    setEditProgress(null)
  }

  if (loading) return <div style={{ padding:32, color:'var(--text3)' }}>Loading goals...</div>

  const totalGoals = goals.length
  const achieved = goals.filter(g => g.progress >= 100).length
  const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length

  return (
    <div style={{ maxWidth: 860, margin:'0 auto', padding:'28px 32px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:500, marginBottom:4 }}>Goals</h1>
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>
          Your milestones — revenue targets, customer wins, deals closed.
        </p>
        {/* Summary chips */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
          <span style={chipStyle('#37352F','#fff')}>{totalGoals} total</span>
          <span style={chipStyle('#E1F5EE','#0A4A37')}>🏆 {achieved} achieved</span>
          <span style={chipStyle('#FBF0E0','#7A4A10')}>🔥 {inProgress} in progress</span>
          <span style={chipStyle('#F7F6F3','#787672')}>💤 {totalGoals-achieved-inProgress} not started</span>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          + Add goal
        </button>
      </div>

      {/* Goals by horizon */}
      {HORIZONS.map(h => {
        const gs = grouped[h.key]
        if (!gs.length) return null
        return (
          <div key={h.key} style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color: h.color }}>{h.label}</span>
              <span style={{ flex:1, height:1, background:'var(--border)' }}></span>
              <span style={{ fontSize:11, color:'var(--text3)' }}>{gs.length} goal{gs.length!==1?'s':''}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {gs.map(g => {
                const status = getStatus(g)
                const st = STATUS_STYLE[status]
                const vc = VC[g.venture] || 'gray'
                const hex = VH[g.venture] || '#888'
                const isEditingProgress = editProgress === g.id
                return (
                  <div key={g.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', transition:'box-shadow .15s' }}
                    onMouseOver={e => (e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)')}
                    onMouseOut={e => (e.currentTarget.style.boxShadow='none')}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>

                      {/* Left — title + meta */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                          <span style={{ fontSize:16, fontWeight:500, color: g.progress>=100 ? 'var(--text3)' : 'var(--text)', textDecoration: g.progress>=100 ? 'line-through' : 'none' }}>
                            {g.title}
                          </span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom: g.description ? 8 : 0 }}>
                          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:5, fontWeight:500, background:`var(--${vc}-bg)`, color:`var(--${vc}-dark)` }}>{g.venture}</span>
                          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:5, fontWeight:500, background: st.bg, color: st.color }}>{st.label}</span>
                          {g.deadline && <span style={{ fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:3 }}>📅 {g.deadline}</span>}
                        </div>
                        {g.description && <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:10 }}>{g.description}</p>}

                        {/* Progress bar + edit */}
                        <div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                            <span style={{ fontSize:11, color:'var(--text3)' }}>Progress</span>
                            {isEditingProgress ? (
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <input
                                  type="number" min="0" max="100" value={progressVal}
                                  onChange={e => setProgressVal(Number(e.target.value))}
                                  style={{ width:54, fontSize:12, padding:'2px 6px', border:'1px solid var(--border2)', borderRadius:5, textAlign:'center', outline:'none' }}
                                  autoFocus
                                  onKeyDown={e => { if(e.key==='Enter') handleProgressSave(g.id); if(e.key==='Escape') setEditProgress(null) }}
                                />
                                <span style={{ fontSize:11, color:'var(--text3)' }}>%</span>
                                <button onClick={() => handleProgressSave(g.id)} style={{ fontSize:11, padding:'2px 8px', background:'var(--text)', color:'#fff', border:'none', borderRadius:5, cursor:'pointer' }}>Save</button>
                                <button onClick={() => setEditProgress(null)} style={{ fontSize:11, padding:'2px 8px', background:'transparent', color:'var(--text2)', border:'none', cursor:'pointer' }}>×</button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditProgress(g.id); setProgressVal(g.progress) }} style={{ fontSize:11, color: hex, fontWeight:600, background:'transparent', border:'none', cursor:'pointer' }}>
                                {g.progress}% — update
                              </button>
                            )}
                          </div>
                          <div style={{ height:6, background:'var(--bg3)', borderRadius:4, overflow:'hidden' }}>
                            <div style={{ height:6, borderRadius:4, background: g.progress>=100 ? '#0F6E56' : hex, width:`${g.progress}%`, transition:'width .4s ease' }} />
                          </div>
                        </div>

                        {/* Quick progress buttons */}
                        {!isEditingProgress && g.progress < 100 && (
                          <div style={{ display:'flex', gap:5, marginTop:10 }}>
                            {[25,50,75,100].map(pct => (
                              <button key={pct} onClick={() => updateGoal(g.id, { progress: pct, milestones: g.milestones })}
                                style={{ fontSize:10, padding:'3px 9px', borderRadius:20, border:'1px solid var(--border)', background: g.progress===pct ? hex : 'transparent', color: g.progress===pct ? '#fff' : 'var(--text3)', cursor:'pointer', transition:'all .12s' }}>
                                {pct === 100 ? '🏆 Done!' : `${pct}%`}
                              </button>
                            ))}
                          </div>
                        )}

                        {g.progress >= 100 && (
                          <div style={{ marginTop:10, fontSize:13, color:'#0A4A37', fontWeight:500 }}>🎉 Goal achieved!</div>
                        )}
                      </div>

                      {/* Right — delete */}
                      <button onClick={() => deleteGoal(g.id)} style={{ color:'var(--text3)', background:'none', border:'none', cursor:'pointer', fontSize:18, padding:'0 2px', opacity:.5, lineHeight:1 }}
                        onMouseOver={e => (e.currentTarget.style.opacity='1')}
                        onMouseOut={e => (e.currentTarget.style.opacity='.5')}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {goals.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text3)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
          <div style={{ fontSize:16, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>No goals yet</div>
          <div style={{ fontSize:13, marginBottom:20 }}>Add your first milestone — a revenue target, a customer win, a deal to close.</div>
          <button onClick={() => setShowModal(true)} style={btnPrimary}>Add first goal</button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,15,15,.45)', zIndex:300, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'56px 20px', overflowY:'auto' }}
          onClick={e => { if(e.target===e.currentTarget) setShowModal(false) }}>
          <form onSubmit={handleAdd} style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, boxShadow:'0 12px 40px rgba(0,0,0,.14)', overflow:'hidden' }}>

            {/* Emoji + Title */}
            <div style={{ padding:'22px 24px 14px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text3)', marginBottom:10 }}>What do you want to achieve?</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {/* Emoji picker */}
                <div style={{ position:'relative' }}>
                  <select value={form.emoji} onChange={e => setForm(f=>({...f, emoji:e.target.value}))}
                    style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}>
                    {['🎯','💰','🤝','👥','📦','📈','🏆','🚀','💡','🔥','⭐','💎'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <div style={{ width:44, height:44, borderRadius:10, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, cursor:'pointer', background:'var(--bg2)' }}>
                    {form.emoji}
                  </div>
                </div>
                <input value={form.title} onChange={e => setForm(f=>({...f, title:e.target.value}))}
                  placeholder="e.g. 10 paying customers on QuizMe" autoFocus
                  style={{ flex:1, fontFamily:'Cormorant Garamond,serif', fontSize:22, border:'none', outline:'none', background:'transparent' }} />
              </div>

              {/* Template suggestions */}
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Quick templates</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {GOAL_TEMPLATES.map(t => (
                    <button key={t.label} type="button"
                      onClick={() => setForm(f => ({...f, title: t.example, emoji: t.emoji}))}
                      style={{ fontSize:11, padding:'4px 10px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text2)', cursor:'pointer' }}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Properties */}
            <div style={{ padding:'14px 24px', display:'flex', flexDirection:'column', gap:12 }}>

              {/* Target number */}
              <div style={row}>
                <span style={label}>Target</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="number" value={form.target||''} onChange={e => setForm(f=>({...f, target:Number(e.target.value)}))}
                    placeholder="e.g. 10000" style={{ width:90, fontSize:13, padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, outline:'none', background:'var(--bg2)' }} />
                  <input value={form.unit} onChange={e => setForm(f=>({...f, unit:e.target.value}))}
                    placeholder="THB/month, customers, deals..." style={{ flex:1, fontSize:13, padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, outline:'none', background:'var(--bg2)' }} />
                </div>
              </div>

              {/* Venture */}
              <div style={row}>
                <span style={label}>Venture</span>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(['Veranin','QuizMe','RUNRUN','YOO Home','Personal'] as Venture[]).map(v => (
                    <button key={v} type="button" onClick={() => setForm(f=>({...f, venture:v}))}
                      style={{ fontSize:12, padding:'4px 12px', borderRadius:20, border:'1px solid var(--border)', background: form.venture===v ? 'var(--text)' : 'transparent', color: form.venture===v ? '#fff' : 'var(--text2)', cursor:'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horizon */}
              <div style={row}>
                <span style={label}>By when</span>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {HORIZONS.map(h => (
                    <button key={h.key} type="button" onClick={() => setForm(f=>({...f, horizon:h.key}))}
                      style={{ fontSize:12, padding:'4px 12px', borderRadius:20, border:'1px solid var(--border)', background: form.horizon===h.key ? 'var(--text)' : 'transparent', color: form.horizon===h.key ? '#fff' : 'var(--text2)', cursor:'pointer' }}>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div style={row}>
                <span style={label}>Deadline</span>
                <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f, deadline:e.target.value}))}
                  style={{ fontSize:13, padding:'5px 8px', border:'1px solid var(--border)', borderRadius:6, outline:'none', background:'var(--bg2)', cursor:'pointer' }} />
              </div>

              {/* Notes */}
              <div style={row}>
                <span style={label}>Notes</span>
                <textarea value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))}
                  placeholder="Why does this matter? How will you know you've hit it?" rows={2}
                  style={{ flex:1, fontSize:13, padding:'6px 8px', border:'1px solid var(--border)', borderRadius:6, outline:'none', background:'var(--bg2)', resize:'none', fontFamily:'inherit', lineHeight:1.6 }} />
              </div>
            </div>

            <div style={{ padding:'12px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding:'7px 14px', background:'transparent', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save goal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const chipStyle = (bg: string, color: string): React.CSSProperties => ({
  display:'inline-flex', alignItems:'center', padding:'5px 12px', borderRadius:20,
  fontSize:12, background:bg, color, fontWeight:500, border:'1px solid rgba(55,53,47,.06)'
})
const btnPrimary: React.CSSProperties = { padding:'8px 18px', background:'#37352F', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }
const row: React.CSSProperties = { display:'flex', alignItems:'flex-start', gap:14 }
const label: React.CSSProperties = { fontSize:12, color:'var(--text3)', width:72, flexShrink:0, paddingTop:6 }
