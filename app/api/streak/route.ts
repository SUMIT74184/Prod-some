
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

async function getStreakCollection() {
  const db = await getDb()
  return db.collection("streaks")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 })
  }

  try {
    const streakCollection = await getStreakCollection()
    const streakData = await streakCollection.findOne({ userId })
    if (streakData) {
      const { _id, ...rest } = streakData
      return NextResponse.json({ id: _id.toString(), ...rest })
    }
    return NextResponse.json(null)
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch streak", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId, streak, lastActiveDate } = await request.json()

  if (!userId || streak === undefined || !lastActiveDate) {
    return NextResponse.json({ message: "userId, streak and lastActiveDate are required" }, { status: 400 })
  }

  try {
    const streakCollection = await getStreakCollection()
    const result = await streakCollection.updateOne({ userId }, { $set: { streak, lastActiveDate } }, { upsert: true })
    return NextResponse.json({ message: "Streak updated successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update streak", error: error.message }, { status: 500 })
  }
}
