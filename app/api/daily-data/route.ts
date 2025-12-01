
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { DailyData } from "@/lib/types"

async function getDailyDataCollection() {
  const db = await getDb()
  return db.collection<DailyData>("dailyData")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 })
  }

  try {
    const dailyDataCollection = await getDailyDataCollection()
    const dailyData = await dailyDataCollection.find({ userId }).toArray()
    const sanitizedDailyData = dailyData.map((data) => {
      const { _id, ...rest } = data
      return { id: _id.toString(), ...rest }
    })
    return NextResponse.json(sanitizedDailyData)
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch daily data", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { date, tasks, goals, userId } = await request.json()

  if (!date || !userId) {
    return NextResponse.json({ message: "date and userId are required" }, { status: 400 })
  }

  try {
    const dailyDataCollection = await getDailyDataCollection()

    await dailyDataCollection.updateOne(
      { date, userId },
      { $set: { tasks, goals, date, userId } },
      { upsert: true }
    )

    const updatedDoc = await dailyDataCollection.findOne({ date, userId })

    if (updatedDoc) {
      const { _id, ...rest } = updatedDoc
      return NextResponse.json({ id: _id.toString(), ...rest }, { status: 200 })
    }

    return NextResponse.json({ message: "Failed to update or create daily data" }, { status: 500 })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create or update daily data", error: error.message }, { status: 500 })
  }
}
