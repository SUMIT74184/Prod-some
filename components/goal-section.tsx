"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Target, CheckCircle } from "lucide-react"
import type { Goal } from "@/lib/types"

interface GoalSectionProps {
  goals: Goal[]
  onAddGoal: (title: string, target: number) => void
  onUpdateProgress: (id: string, progress: number) => void
  onDeleteGoal: (id: string) => void
}

export function GoalSection({ goals, onAddGoal, onUpdateProgress, onDeleteGoal }: GoalSectionProps) {
  const [newGoal, setNewGoal] = useState("")
  const [target, setTarget] = useState(100)

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onAddGoal(newGoal.trim(), target)
      setNewGoal("")
      setTarget(100)
    }
  }

  const todayGoals = goals.filter((goal) => {
    const goalDate = new Date(goal.createdAt).toDateString()
    const today = new Date().toDateString()
    return goalDate === today
  })

  const oldCompletedGoals = goals.filter((goal) => {
    const goalDate = new Date(goal.createdAt).toDateString()
    const today = new Date().toDateString()
    return goalDate !== today && goal.completed
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Target className="w-5 h-5 text-chart-2" />
          Today's Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={handleAddGoal} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Target:</span>
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-20 h-7 bg-input border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {todayGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No goals for today. Set one to stay motivated!
            </p>
          ) : (
            todayGoals.map((goal) => (
              <div key={goal.id} className="p-3 rounded-lg bg-secondary/50 space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {goal.completed ? (
                      <CheckCircle className="w-4 h-4 text-chart-1" />
                    ) : (
                      <Target className="w-4 h-4 text-chart-2" />
                    )}
                    <span
                      className={`text-sm ${goal.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {goal.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  <Slider
                    value={[goal.progress]}
                    max={goal.target}
                    step={1}
                    onValueChange={([value]) => onUpdateProgress(goal.id, value)}
                    className="w-full"
                    disabled={goal.completed}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {oldCompletedGoals.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-2">Completed Goals</h3>
            <div className="space-y-3 max-h-32 overflow-y-auto">
            {oldCompletedGoals.map((goal) => (
              <div key={goal.id} className="p-3 rounded-lg bg-secondary/50 space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-chart-1" />
                    <span className="text-sm text-muted-foreground line-through">{goal.title}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
