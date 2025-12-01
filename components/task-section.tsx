"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ListTodo } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskSectionProps {
  tasks: Task[]
  onAddTask: (title: string) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
}

export function TaskSection({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskSectionProps) {
  const [newTask, setNewTask] = useState("")

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim())
      setNewTask("")
    }
  }

  const todayTasks = tasks.filter((task) => new Date(task.createdAt).toDateString() === new Date().toDateString())

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ListTodo className="w-5 h-5 text-chart-1" />
          Today's Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button onClick={handleAddTask} size="icon" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todayTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No tasks for today. Add one to get started!
            </p>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group transition-all ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  className="border-muted-foreground data-[state=checked]:bg-chart-1 data-[state=checked]:border-chart-1"
                />
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
