"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Trophy, Sparkles, PartyPopper } from "lucide-react"
import type { WeeklyRating, DailyData } from "@/lib/types"
import Confetti from "react-confetti"

interface WeeklyRatingPopupProps {
  dailyData: DailyData[]
  onRatingSubmit: (rating: WeeklyRating) => void
}

export function WeeklyRatingPopup({ dailyData, onRatingSubmit }: WeeklyRatingPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [weekStats, setWeekStats] = useState({ tasks: 0, goals: 0 })

  useEffect(() => {
    checkWeekCompletion()
  }, [])

  const checkWeekCompletion = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    // Check if it's Sunday (end of week) or if user hasn't rated this week yet
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - dayOfWeek)
    currentWeekStart.setHours(0, 0, 0, 0)

    const lastRatingDate = localStorage.getItem("lastWeeklyRating")
    const weekKey = currentWeekStart.toISOString().split("T")[0]

    // Show popup on Sunday or if a full week has passed since last rating
    if (dayOfWeek === 0 && lastRatingDate !== weekKey) {
      // Calculate week stats
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 7)

      const weekData = dailyData.filter((d) => {
        const date = new Date(d.date)
        return date >= weekStart && date <= today
      })

      const totalTasks = weekData.reduce((sum, d) => sum + d.tasks, 0)
      const totalGoals = weekData.reduce((sum, d) => sum + d.goals, 0)

      setWeekStats({ tasks: totalTasks, goals: totalGoals })
      setIsOpen(true)
    }
  }

  const handleSubmit = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - 7)

    const newRating: WeeklyRating = {
      id: Date.now().toString(),
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: today.toISOString().split("T")[0],
      rating,
      notes: notes || undefined,
      tasksCompleted: weekStats.tasks,
      goalsCompleted: weekStats.goals,
      createdAt: new Date().toISOString(),
    }

    onRatingSubmit(newRating)

    // Store the week key to prevent showing again
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay())
    localStorage.setItem("lastWeeklyRating", currentWeekStart.toISOString().split("T")[0])

    // Show celebration
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      setIsOpen(false)
      setRating(0)
      setNotes("")
    }, 3000)
  }

  const getRatingLabel = (r: number) => {
    if (r <= 2) return "Needs Improvement"
    if (r <= 4) return "Fair"
    if (r <= 6) return "Good"
    if (r <= 8) return "Great"
    return "Excellent!"
  }

  const getRatingColor = (r: number) => {
    if (r <= 2) return "text-destructive"
    if (r <= 4) return "text-warning"
    if (r <= 6) return "text-chart-2"
    if (r <= 8) return "text-chart-1"
    return "text-primary"
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 300}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trophy className="w-6 h-6 text-primary" />
              Weekly Performance Review
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Great job completing another week! Rate your performance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Week Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-primary">{weekStats.tasks}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-chart-2">{weekStats.goals}</p>
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Rate your performance (1-10)</p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredRating || rating) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(hoveredRating || rating) > 0 && (
                <p className={`text-center text-sm font-medium ${getRatingColor(hoveredRating || rating)}`}>
                  {hoveredRating || rating}/10 - {getRatingLabel(hoveredRating || rating)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Reflections (optional)</p>
              <Textarea
                placeholder="What went well? What could be improved?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary/50 border-border resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Submit Rating & Celebrate
              <PartyPopper className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual trigger for testing */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-card border-border text-foreground hover:bg-secondary"
      >
        <Star className="w-4 h-4 mr-2" />
        Rate Week
      </Button>
    </>
  )
}
