"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Calendar } from "lucide-react"
import type { DailyData } from "@/lib/types"

interface MonthlyActivityChartProps {
  dailyData: DailyData[]
}

export function MonthlyActivityChart({ dailyData }: MonthlyActivityChartProps) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  const chartData = last30Days.map((date) => {
    const data = dailyData.find((d) => d.date === date)
    return {
      date: new Date(date).getDate().toString(),
      total: (data?.tasks || 0) + (data?.goals || 0),
      tasks: data?.tasks || 0,
      goals: data?.goals || 0,
    }
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Calendar className="w-5 h-5 text-chart-2" />
          Monthly Activity (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval={4}
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
                formatter={(value: number, name: string) => [value, name === "total" ? "Total Completions" : name]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#colorTotal)"
                name="Total Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-3 h-3 rounded bg-[#4ade80]" />
          <span className="text-xs text-muted-foreground">Total Completions</span>
        </div>
      </CardContent>
    </Card>
  )
}
