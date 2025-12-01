import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Target, Flame, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  totalTasks: number
  completedTasks: number
  totalGoals: number
  completedGoals: number
  streak: number
  taskCompletion: number
  goalCompletion: number
}

export function StatsCards({
  totalTasks,
  completedTasks,
  totalGoals,
  completedGoals,
  streak,
  taskCompletion,
  goalCompletion,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Tasks Completed",
      value: `${completedTasks}/${totalTasks}`,
      percentage: taskCompletion,
      icon: CheckCircle2,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Goals Achieved",
      value: `${completedGoals}/${totalGoals}`,
      percentage: goalCompletion,
      icon: Target,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Current Streak",
      value: `${streak} days`,
      percentage: Math.min(streak * 10, 100),
      icon: Flame,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Overall Performance",
      value: `${Math.round((taskCompletion + goalCompletion) / 2)}%`,
      percentage: Math.round((taskCompletion + goalCompletion) / 2),
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium ${stat.color}`}>{stat.percentage}%</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stat.color.replace("text-", "bg-")}`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
