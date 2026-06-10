'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Goal, Milestone } from '@/types/database'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchGoals = useCallback(async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setGoals(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchGoals()
    const channel = supabase
      .channel('goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, fetchGoals)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchGoals, supabase])

  async function addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('goals').insert({ ...goal, user_id: user.id }).select().single()
    if (data) setGoals(prev => [data, ...prev])
  }

  async function updateGoal(id: string, updates: Partial<Goal>) {
    const { data } = await supabase.from('goals').update(updates).eq('id', id).select().single()
    if (data) setGoals(prev => prev.map(g => g.id === id ? data : g))
  }

  async function toggleMilestone(goalId: string, index: number) {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const milestones: Milestone[] = goal.milestones.map((m, i) =>
      i === index ? { ...m, done: !m.done } : m
    )
    const progress = Math.round(milestones.filter(m => m.done).length / milestones.length * 100)
    await updateGoal(goalId, { milestones, progress })
  }

  async function deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, loading, addGoal, updateGoal, toggleMilestone, deleteGoal }
}
