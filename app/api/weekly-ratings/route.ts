
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { WeeklyRating } from "@/lib/types"

async function getWeeklyRatingCollection() {
  const db = await getDb()
  return db.collection<WeeklyRating>("weeklyRatings")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 })
  }

  try {
    const weeklyRatingCollection = await getWeeklyRatingCollection()
    const weeklyRatings = await weeklyRatingCollection.find({ userId }).toArray()
    const sanitizedWeeklyRatings = weeklyRatings.map((rating) => {
      const { _id, ...rest } = rating
      return { id: _id.toString(), ...rest }
    })
    return NextResponse.json(sanitizedWeeklyRatings)
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch weekly ratings", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { weekStart, weekEnd, rating, notes, tasksCompleted, goalsCompleted, userId } = await request.json()

  if (!weekStart || !weekEnd || !rating || !userId) {
    return NextResponse.json({ message: "weekStart, weekEnd, rating and userId are required" }, { status: 400 })
  }

  const newWeeklyRating: Omit<WeeklyRating, "id"> = {
    weekStart,
    weekEnd,
    rating,
    notes,
    tasksCompleted,
    goalsCompleted,
    userId,
    createdAt: new Date().toISOString(),
  }

  try {
    const weeklyRatingCollection = await getWeeklyRatingCollection()
    const result = await weeklyRatingCollection.insertOne(newWeeklyRating as WeeklyRating)
    const insertedWeeklyRating = { ...newWeeklyRating, id: result.insertedId.toString() }
    return NextResponse.json(insertedWeeklyRating, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create weekly rating", error: error.message }, { status: 500 })
  }
}
