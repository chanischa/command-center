export type Venture = 'Veranin' | 'QuizMe' | 'RUNRUN' | 'YOO Home' | 'Personal'
export type TimeWindow = 'commute' | 'lunch' | 'evening'
export type Priority = 'low' | 'medium' | 'high'
export type Horizon = '3month' | '6month' | '1year' | '3year'

export interface Task {
  id: string
  user_id: string
  title: string
  venture: Venture
  win: TimeWindow
  subtime: string
  tags: string[]
  priority: Priority
  due_date: string | null
  notes: string
  done: boolean
  created_at: string
  updated_at: string
}

export interface Milestone {
  text: string
  done: boolean
}

export interface Goal {
  id: string
  user_id: string
  title: string
  venture: Venture
  horizon: Horizon
  deadline: string
  description: string
  progress: number
  milestones: Milestone[]
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  calendar_url: string | null
  venture_progress: Record<string, number>
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
