"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { TaskSection } from "@/components/task-section"
import { GoalSection } from "@/components/goal-section"
import { StreakSection } from "@/components/streak-section"
import { DailyActivityChart } from "@/components/daily-activity-chart"
import { MonthlyActivityChart } from "@/components/monthly-activity-chart"
import { PerformanceChart } from "@/components/performance-chart"
import { YearlyContributionGraph } from "@/components/yearly-contribution-graph"
import { WeeklyRatingPopup } from "@/components/weekly-rating-popup"
import { WeeklyRatingsHistory } from "@/components/weekly-ratings-history"
import { useAuth } from "@/lib/auth-context"
import type { Task, Goal, DailyData, WeeklyRating, Streak } from "@/lib/types"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [streak, setStreak] = useState(0)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [weeklyRatings, setWeeklyRatings] = useState<WeeklyRating[]>([])
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        const response = await fetch(`/api/tasks?userId=${user.id}`)
        if (response.ok) {
          const tasks = await response.json()
          setTasks(tasks)
        }
      }
      fetchTasks()

      const fetchGoals = async () => {
        const response = await fetch(`/api/goals?userId=${user.id}`)
        if (response.ok) {
          const goals = await response.json()
          setGoals(goals)
        }
      }
      fetchGoals()

      const fetchDailyData = async () => {
        const response = await fetch(`/api/daily-data?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setDailyData(data)
        }
      }
      fetchDailyData()

      const fetchWeeklyRatings = async () => {
        const response = await fetch(`/api/weekly-ratings?userId=${user.id}`)
        if (response.ok) {
          const ratings = await response.json()
          setWeeklyRatings(ratings)
        }
      }
      fetchWeeklyRatings()

      const fetchStreak = async () => {
        const response = await fetch(`/api/streak?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setStreak(data.streak)
          }
        }
      }
      fetchStreak()
    }
  }, [user])

  const checkAndUpdateStreak = async () => {
    if (!user) return
    const response = await fetch(`/api/streak?userId=${user.id}`)
    if (response.ok) {
      const data = await response.json()
      const today = new Date().toDateString()
      let lastActiveDate = ""
      let currentStreak = 0
      if (data) {
        lastActiveDate = data.lastActiveDate
        currentStreak = data.streak
      }

      if (lastActiveDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        let newStreak = currentStreak
        if (lastActiveDate === yesterday.toDateString()) {
          newStreak = currentStreak + 1
        } else {
          newStreak = 1
        }
        setStreak(newStreak)

        await fetch("/api/streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, streak: newStreak, lastActiveDate: today }),
        })
        updateDailyData()
      }
    }
  }

  const updateDailyData = async (completedTasksCount?: number, completedGoalsCount?: number) => {
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    const tasksToUse = completedTasksCount !== undefined ? completedTasksCount : tasks.filter((t) => t.completed).length
    const goalsToUse = completedGoalsCount !== undefined ? completedGoalsCount : goals.filter((g) => g.completed).length

    const response = await fetch("/api/daily-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, tasks: tasksToUse, goals: goalsToUse, userId: user.id }),
    })

    if (response.ok) {
      const newDailyData = await response.json()
      setDailyData((prev) => {
        const existing = prev.find((d) => d.date === today)
        if (existing) {
          return prev.map((d) => (d.date === today ? newDailyData : d))
        }
        return [...prev, newDailyData]
      })
    }
  }

  const addTask = async (title: string) => {
    if (!user) return
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userId: user.id }),
    })
    if (response.ok) {
      const newTask = await response.json()
      setTasks((prev) => [...prev, newTask])
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    })

    if (response.ok) {
      setTasks((prev) => {
        const updatedTasks = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        const newCompletedTasksCount = updatedTasks.filter((t) => t.completed).length
        updateDailyData(newCompletedTasksCount, undefined)
        checkAndUpdateStreak() // Call checkAndUpdateStreak after daily data is updated
        return updatedTasks
      })
    }
  }

  const deleteTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setTasks((prev) => prev.filter((task) => task.id !== id))
    }
  }

  const addGoal = async (title: string, target: number) => {
    if (!user) return
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, target, userId: user.id }),
    })
    if (response.ok) {
      const newGoal = await response.json()
      setGoals((prev) => [...prev, newGoal])
    }
  }

  const updateGoalProgress = async (id: string, progress: number) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    const response = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, completed: progress >= goal.target }),
    })

    if (response.ok) {
      setGoals((prev) => {
        const updatedGoals = prev.map((g) => (g.id === id ? { ...g, progress, completed: progress >= g.target } : g))
        const newCompletedGoalsCount = updatedGoals.filter((g) => g.completed).length
        updateDailyData(undefined, newCompletedGoalsCount)
        checkAndUpdateStreak() // Call checkAndUpdateStreak after daily data is updated
        return updatedGoals
      })
    }
  }

  const deleteGoal = async (id: string) => {
    const response = await fetch(`/api/goals/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setGoals((prev) => prev.filter((goal) => goal.id !== id))
    }
  }

  const handleWeeklyRating = async (rating: Omit<WeeklyRating, "id" | "userId" | "createdAt">) => {
    if (!user) return
    const response = await fetch("/api/weekly-ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rating, userId: user.id }),
    })
    if (response.ok) {
      const newRating = await response.json()
      setWeeklyRatings((prev) => [...prev, newRating])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const completedTasks = tasks.filter((t) => t.completed).length
  const completedGoals = goals.filter((g) => g.completed).length
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const goalCompletion = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
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

        <WeeklyRatingsHistory ratings={weeklyRatings} />
      </main>

      <WeeklyRatingPopup dailyData={dailyData} onRatingSubmit={handleWeeklyRating} />
    </div>
  )
}
