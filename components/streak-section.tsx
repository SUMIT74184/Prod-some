import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Calendar, TrendingUp } from "lucide-react"
import type { DailyData } from "@/lib/types"

interface StreakSectionProps {
  streak: number
  dailyData: DailyData[]
}

export function StreakSection({ streak, dailyData }: StreakSectionProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

  const getActivityLevel = (date: string) => {
    const data = dailyData.find((d) => d.date === date)
    if (!data) return 0
    const total = data.tasks + data.goals
    if (total >= 5) return 3
    if (total >= 3) return 2
    if (total >= 1) return 1
    return 0
  }

  const activityColors = ["bg-secondary", "bg-chart-1/30", "bg-chart-1/60", "bg-chart-1"]

  const longestStreak = Math.max(streak, ...dailyData.map(() => streak))
  const avgTasksPerDay =
    dailyData.length > 0 ? Math.round(dailyData.reduce((acc, d) => acc + d.tasks, 0) / dailyData.length) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Flame className="w-5 h-5 text-chart-3" />
          Streak & Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-chart-3/10 mb-3">
            <div className="text-center">
              <Flame className="w-8 h-8 text-chart-3 mx-auto mb-1" />
              <span className="text-2xl font-bold text-foreground">{streak}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Last 7 Days</p>
          <div className="flex justify-between gap-1">
            {last7Days.map((date, i) => {
              const level = getActivityLevel(date)
              const isToday = date === new Date().toISOString().split("T")[0]
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{dayLabels[new Date(date).getDay()]}</span>
                  <div
                    className={`w-8 h-8 rounded-md ${activityColors[level]} ${
                      isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    } transition-all`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-lg font-bold text-foreground">{longestStreak} days</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-chart-1" />
              <span className="text-xs text-muted-foreground">Avg Tasks/Day</span>
            </div>
            <p className="text-lg font-bold text-foreground">{avgTasksPerDay}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
