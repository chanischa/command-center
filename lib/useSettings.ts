'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { UserSettings } from '@/types/database'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setSettings(data)
    } else {
      // Create default settings for new user
      const { data: created } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, venture_progress: { Veranin: 0, QuizMe: 0, RUNRUN: 0, 'YOO Home': 0 } } as any)
        .select()
        .single()
      if (created) setSettings(created)
    }
  }, [supabase])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  async function updateSettings(updates: Partial<UserSettings>) {
    if (!settings) return
    const { data } = await supabase
      .from('user_settings')
      .update(updates as any)
      .eq('id', settings.id)
      .select()
      .single()
    if (data) setSettings(data)
  }

  async function updateVentureProgress(venture: string, value: number) {
    if (!settings) return
    const progress = { ...settings.venture_progress, [venture]: value }
    await updateSettings({ venture_progress: progress })
  }

  return { settings, updateSettings, updateVentureProgress }
}
