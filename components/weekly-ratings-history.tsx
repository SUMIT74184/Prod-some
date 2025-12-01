"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, TrendingUp, Calendar } from "lucide-react"
import type { WeeklyRating } from "@/lib/types"

interface WeeklyRatingsHistoryProps {
  ratings: WeeklyRating[]
}

export function WeeklyRatingsHistory({ ratings }: WeeklyRatingsHistoryProps) {
  if (ratings.length === 0) {
    return null
  }

  const sortedRatings = [...ratings].sort((a, b) => new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime())

  const averageRating =
    ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : "0"

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          Weekly Performance History
          <span className="ml-auto text-sm font-normal text-muted-foreground">Avg: {averageRating}/10</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRatings.slice(0, 5).map((rating) => (
            <div
              key={rating.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < rating.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{rating.rating}/10</p>
                {rating.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{rating.notes}</p>}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(rating.weekStart)} - {formatDate(rating.weekEnd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {rating.tasksCompleted} tasks, {rating.goalsCompleted} goals
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
