
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { Task } from "@/lib/types"
import { ObjectId } from "mongodb"

async function getTaskCollection() {
  const db = await getDb()
  return db.collection<Task>("tasks")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 })
  }

  try {
    const tasksCollection = await getTaskCollection()
    const tasks = await tasksCollection.find({ userId }).toArray()
    const sanitizedTasks = tasks.map((task) => {
      const { _id, ...rest } = task
      return { id: _id.toString(), ...rest }
    })
    return NextResponse.json(sanitizedTasks)
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch tasks", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { title, userId } = await request.json()

  if (!title || !userId) {
    return NextResponse.json({ message: "title and userId are required" }, { status: 400 })
  }

  const newTask: Omit<Task, "id"> = {
    title,
    userId,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  try {
    const tasksCollection = await getTaskCollection()
    const result = await tasksCollection.insertOne(newTask as Task)
    const insertedTask = { ...newTask, id: result.insertedId.toString() }
    return NextResponse.json(insertedTask, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create task", error: error.message }, { status: 500 })
  }
}
