"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { TaskSection } from "@/components/task-section"
import { GoalSection } from "@/components/goal-section"
import { StreakSection } from "@/components/streak-section"
import { DailyActivityChart } from "@/components/daily-activity-chart"
import { MonthlyActivityChart } from "@/components/monthly-activity-chart"
import { PerformanceChart } from "@/components/performance-chart"
import { YearlyContributionGraph } from "@/components/yearly-contribution-graph"
import type { Task, Goal, DailyData } from "@/lib/types"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [streak, setStreak] = useState(0)
  const [dailyData, setDailyData] = useState<DailyData[]>([])

  useEffect(() => {
    // Load data from localStorage
    const savedTasks = localStorage.getItem("tasks")
    const savedGoals = localStorage.getItem("goals")
    const savedStreak = localStorage.getItem("streak")
    const savedDailyData = localStorage.getItem("dailyData")

    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedGoals) setGoals(JSON.parse(savedGoals))
    if (savedStreak) setStreak(JSON.parse(savedStreak))
    if (savedDailyData) setDailyData(JSON.parse(savedDailyData))

    // Initialize streak tracking
    checkAndUpdateStreak()
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("goals", JSON.stringify(goals))
    localStorage.setItem("streak", JSON.stringify(streak))
    localStorage.setItem("dailyData", JSON.stringify(dailyData))
  }, [tasks, goals, streak, dailyData])

  const checkAndUpdateStreak = () => {
    const today = new Date().toDateString()
    const lastActive = localStorage.getItem("lastActiveDate")

    if (lastActive !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastActive === yesterday.toDateString()) {
        setStreak((prev) => prev + 1)
      } else if (lastActive !== today) {
        setStreak(1)
      }

      localStorage.setItem("lastActiveDate", today)
      updateDailyData()
    }
  }

  const updateDailyData = () => {
    const today = new Date().toISOString().split("T")[0]
    const completedTasks = tasks.filter((t) => t.completed).length
    const completedGoals = goals.filter((g) => g.completed).length

    setDailyData((prev) => {
      const existing = prev.find((d) => d.date === today)
      if (existing) {
        return prev.map((d) => (d.date === today ? { ...d, tasks: completedTasks, goals: completedGoals } : d))
      }
      return [...prev.slice(-29), { date: today, tasks: completedTasks, goals: completedGoals }]
    })
  }

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    setTimeout(updateDailyData, 0)
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const addGoal = (title: string, target: number) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      target,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setGoals((prev) => [...prev, newGoal])
  }

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, progress, completed: progress >= goal.target } : goal)),
    )
    setTimeout(updateDailyData, 0)
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  const completedTasks = tasks.filter((t) => t.completed).length
  const completedGoals = goals.filter((g) => g.completed).length
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const goalCompletion = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <>
          <Header />
          <main className="container mx-auto px-4 py-6 space-y-6">
            <StatsCards
              totalTasks={tasks.length}
              completedTasks={completedTasks}
              totalGoals={goals.length}
              completedGoals={completedGoals}
              streak={streak}
              taskCompletion={taskCompletion}
              goalCompletion={goalCompletion}
            />

            <YearlyContributionGraph dailyData={dailyData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TaskSection tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
              <GoalSection
                goals={goals}
                onAddGoal={addGoal}
                onUpdateProgress={updateGoalProgress}
                onDeleteGoal={deleteGoal}
              />
              <StreakSection streak={streak} dailyData={dailyData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyActivityChart dailyData={dailyData} />
              <MonthlyActivityChart dailyData={dailyData} />
            </div>

            <PerformanceChart taskCompletion={taskCompletion} goalCompletion={goalCompletion} dailyData={dailyData} />
          </main>
        </>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  )
}
