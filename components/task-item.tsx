"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: string
  subject: string
  priority: "high" | "medium" | "low"
  justToggled?: boolean
}

interface TaskItemProps {
  task: Task
  onToggleCompletion: (taskId: string) => void
  onEditTask: (task: Task) => void
  onSetReminder: (task: Task) => void
  onAddToFocusSession: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

const TaskItem = memo(function TaskItem({
  task,
  onToggleCompletion,
  onEditTask,
  onSetReminder,
  onAddToFocusSession,
  onDeleteTask,
}: TaskItemProps) {
  const isMobile = useIsMobile()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      Mathematics: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      History: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      Physics: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
      Literature: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
      Chemistry: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      "Computer Science": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    }
    return subjectColors[subject] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isOverdue = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateString)
    return dueDate < today
  }

  return (
    <motion.div
      layout
      className={`flex items-start space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border transition-all duration-300 ${
        task.completed ? "bg-muted/50 dark:bg-muted/20" : isOverdue(task.dueDate) ? "bg-red-50 dark:bg-red-950/20" : ""
      }`}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggleCompletion(task.id)}
        className="mt-1 transition-all duration-300"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <p
            className={`text-sm md:text-base font-medium transition-all duration-300 ${task.completed ? "line-through text-muted-foreground" : ""}`}
          >
            {task.title}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 p-0">
                <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEditTask(task)}>Edit Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetReminder(task)}>Set Reminder</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToFocusSession(task)}>Add to Focus Session</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => onDeleteTask(task)}>
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-1 md:gap-2 text-[10px] md:text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span className={isOverdue(task.dueDate) && !task.completed ? "text-red-500 font-medium" : ""}>
              {formatDate(task.dueDate)}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`${getSubjectColor(task.subject)} text-[10px] md:text-xs px-1 md:px-2 py-0 md:py-0.5`}
          >
            {isMobile && task.subject.length > 10 ? task.subject.substring(0, 10) + "..." : task.subject}
          </Badge>
          <Badge
            variant="outline"
            className={`${getPriorityColor(task.priority)} text-[10px] md:text-xs px-1 md:px-2 py-0 md:py-0.5`}
          >
            {task.priority}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
})

export default TaskItem
