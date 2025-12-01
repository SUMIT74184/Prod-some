
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

async function getTaskCollection() {
  const db = await getDb()
  return db.collection("tasks")
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()

  if (!id) {
    return NextResponse.json({ message: "Task ID is required" }, { status: 400 })
  }

  const { completed } = await request.json()

  if (typeof completed !== "boolean") {
    return NextResponse.json({ message: "completed status is required" }, { status: 400 })
  }

  try {
    const tasksCollection = await getTaskCollection()
    const result = await tasksCollection.updateOne({ _id: new ObjectId(id) }, { $set: { completed } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task updated successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update task", error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()

  if (!id) {
    return NextResponse.json({ message: "Task ID is required" }, { status: 400 })
  }

  try {
    const tasksCollection = await getTaskCollection()
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete task", error: error.message }, { status: 500 })
  }
}
