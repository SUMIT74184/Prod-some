"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { TrendingUp } from "lucide-react"
import type { DailyData } from "@/lib/types"

interface PerformanceChartProps {
  taskCompletion: number
  goalCompletion: number
  dailyData: DailyData[]
}

export function PerformanceChart({ taskCompletion, goalCompletion, dailyData }: PerformanceChartProps) {
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date.toISOString().split("T")[0]
  })

  const chartData = last14Days.map((date, index) => {
    const data = dailyData.find((d) => d.date === date)
    const cumulativeTasks = dailyData.filter((d) => d.date <= date).reduce((acc, d) => acc + d.tasks, 0)
    const cumulativeGoals = dailyData.filter((d) => d.date <= date).reduce((acc, d) => acc + d.goals, 0)

    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tasks: data?.tasks || 0,
      goals: data?.goals || 0,
      performance: Math.min(100, (cumulativeTasks + cumulativeGoals) * 5),
    }
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <TrendingUp className="w-5 h-5 text-chart-4" />
            Performance Overview (Last 14 Days)
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{Math.round((taskCompletion + goalCompletion) / 2)}%</p>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px" }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                name="Tasks Completed"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ fill: "#4ade80", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#4ade80" }}
              />
              <Line
                type="monotone"
                dataKey="goals"
                name="Goals Achieved"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: "#38bdf8", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#38bdf8" }}
              />
              <Line
                type="monotone"
                dataKey="performance"
                name="Performance Score"
                stroke="#f472b6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#f472b6", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#f472b6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
