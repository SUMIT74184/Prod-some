
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { Goal } from "@/lib/types"
import { ObjectId } from "mongodb"

async function getGoalCollection() {
  const db = await getDb()
  return db.collection<Goal>("goals")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 })
  }

  try {
    const goalsCollection = await getGoalCollection()
    const goals = await goalsCollection.find({ userId }).toArray()
    const sanitizedGoals = goals.map((goal) => {
      const { _id, ...rest } = goal
      return { id: _id.toString(), ...rest }
    })
    return NextResponse.json(sanitizedGoals)
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch goals", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { title, target, userId } = await request.json()

  if (!title || !target || !userId) {
    return NextResponse.json({ message: "title, target and userId are required" }, { status: 400 })
  }

  const newGoal: Omit<Goal, "id"> = {
    title,
    target,
    userId,
    progress: 0,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  try {
    const goalsCollection = await getGoalCollection()
    const result = await goalsCollection.insertOne(newGoal as Goal)
    const insertedGoal = { ...newGoal, id: result.insertedId.toString() }
    return NextResponse.json(insertedGoal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create goal", error: error.message }, { status: 500 })
  }
}
