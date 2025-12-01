export interface Task {
  id: string
  userId: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  target: number
  progress: number
  completed: boolean
  createdAt: string
}

export interface DailyData {
  date: string
  userId: string
  tasks: number
  goals: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: "email" | "google" | "facebook" | "github"
  createdAt: string
}

export interface WeeklyRating {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  rating: number
  notes?: string
  tasksCompleted: number
  goalsCompleted: number
  createdAt: string
}

export interface Streak {
  userId: string
  streak: number
  lastActiveDate: string
}
