"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DailyData } from "@/lib/types"

interface YearlyContributionGraphProps {
  dailyData: DailyData[]
}

export function YearlyContributionGraph({ dailyData }: YearlyContributionGraphProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Generate years array dynamically - always shows current year and 2 previous years
  // When currentYear becomes 2026, this will show [2026, 2025, 2024]
  const years = useMemo(() => {
    return [currentYear, currentYear - 1, currentYear - 2]
  }, [currentYear])

  // Ensure selectedYear is valid when years change
  useMemo(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(currentYear)
    }
  }, [years, selectedYear, currentYear])

  const { weeks, months, totalContributions } = useMemo(() => {
    // Generate all days for the selected year
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)

    // Adjust start to the first Sunday before or on Jan 1
    const firstDayOfWeek = startDate.getDay()
    const adjustedStart = new Date(startDate)
    adjustedStart.setDate(adjustedStart.getDate() - firstDayOfWeek)

    // Create a map of daily data for quick lookup
    const dataMap = new Map<string, number>()
    dailyData.forEach((d) => {
      dataMap.set(d.date, d.tasks + d.goals)
    })

    const weeks: { date: Date; count: number }[][] = []
    let currentWeek: { date: Date; count: number }[] = []
    let totalContributions = 0

    const currentDate = new Date(adjustedStart)
    const today = new Date()

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const count = dataMap.get(dateStr) || 0

      // Only count contributions within the selected year
      if (currentDate.getFullYear() === selectedYear) {
        totalContributions += count
      }

      currentWeek.push({
        date: new Date(currentDate),
        count: currentDate <= today && currentDate.getFullYear() === selectedYear ? count : -1,
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)

      if (currentDate > endDate && currentWeek.length === 0) break
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    // Generate month labels
    const months: { name: string; startWeek: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find((d) => d.date.getFullYear() === selectedYear)
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.date.getMonth()
        if (month !== lastMonth) {
          months.push({
            name: firstDayOfWeek.date.toLocaleString("default", { month: "short" }),
            startWeek: weekIndex,
          })
          lastMonth = month
        }
      }
    })

    return { weeks, months, totalContributions }
  }, [dailyData, selectedYear])

  const getContributionLevel = (count: number): string => {
    if (count === -1) return "bg-transparent"
    if (count === 0) return "bg-muted/50"
    if (count <= 2) return "bg-emerald-900"
    if (count <= 4) return "bg-emerald-700"
    if (count <= 6) return "bg-emerald-500"
    return "bg-emerald-400"
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {totalContributions} contributions in {selectedYear}
          </CardTitle>
          <div className="flex gap-1">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className={selectedYear === year ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] text-xs text-muted-foreground pr-2">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[11px] flex items-center">
                {label}
              </div>
            ))}
          </div>

          {/* Graph container */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-fit">
              {/* Month labels */}
              <div className="flex mb-1">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground"
                    style={{
                      marginLeft: i === 0 ? `${month.startWeek * 14}px` : undefined,
                      width: i < months.length - 1 ? `${(months[i + 1].startWeek - month.startWeek) * 14}px` : "auto",
                    }}
                  >
                    {month.name}
                  </div>
                ))}
              </div>

              {/* Contribution grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-[11px] h-[11px] rounded-sm ${getContributionLevel(day.count)} transition-colors`}
                        title={day.count >= 0 ? `${day.count} contributions on ${day.date.toLocaleDateString()}` : ""}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[11px] h-[11px] rounded-sm bg-muted/50" />
            <div className="w-[11px] h-[11px] rounded-sm bg-emerald-900" />
            <div className="w-[11px] h-[11px] rounded-sm bg-emerald-700" />
            <div className="w-[11px] h-[11px] rounded-sm bg-emerald-500" />
            <div className="w-[11px] h-[11px] rounded-sm bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
