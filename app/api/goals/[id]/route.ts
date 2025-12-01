
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

async function getGoalCollection() {
  const db = await getDb()
  return db.collection("goals")
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()

  if (!id) {
    return NextResponse.json({ message: "Goal ID is required" }, { status: 400 })
  }

  const { progress, completed } = await request.json()

  if (progress === undefined || typeof completed !== "boolean") {
    return NextResponse.json({ message: "progress and completed status are required" }, { status: 400 })
  }

  try {
    const goalsCollection = await getGoalCollection()
    const result = await goalsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { progress, completed } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Goal updated successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update goal", error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()

  if (!id) {
    return NextResponse.json({ message: "Goal ID is required" }, { status: 400 })
  }

  try {
    const goalsCollection = await getGoalCollection()
    const result = await goalsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Goal deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete goal", error: error.message }, { status: 500 })
  }
}
