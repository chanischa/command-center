'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Task } from '@/types/database'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTasks()
    // Real-time subscription
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchTasks, supabase])

  async function addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tasks').insert({ ...task, user_id: user.id }).select().single()
    if (data) setTasks(prev => [data, ...prev])
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const { data } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function toggleTask(id: string) {
    const task = tasks.find(t => t.id === id)
    if (task) await updateTask(id, { done: !task.done })
  }

  return { tasks, loading, addTask, updateTask, deleteTask, toggleTask }
}
