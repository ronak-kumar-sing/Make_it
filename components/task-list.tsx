"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import TaskItem, { type Task } from "./task-item"
import { ToastAction } from "@/components/ui/toast"
import { useAppContext } from "@/context/app-context"

interface TaskListProps {
  limit?: number
  onAddTask?: () => void
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

const TaskList = memo(function TaskList({ limit }: TaskListProps) {
  const { setIsAddTaskOpen } = useAppContext()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete Math Assignment",
      completed: false,
      dueDate: "2025-05-15",
      subject: "Mathematics",
      priority: "high",
    },
    {
      id: "2",
      title: "Read Chapter 5 for History",
      completed: false,
      dueDate: "2025-05-16",
      subject: "History",
      priority: "medium",
    },
    {
      id: "3",
      title: "Prepare for Physics Lab",
      completed: true,
      dueDate: "2025-05-14",
      subject: "Physics",
      priority: "high",
    },
    {
      id: "4",
      title: "Submit Literature Essay",
      completed: false,
      dueDate: "2025-05-20",
      subject: "Literature",
      priority: "medium",
    },
    {
      id: "5",
      title: "Study for Chemistry Quiz",
      completed: false,
      dueDate: "2025-05-17",
      subject: "Chemistry",
      priority: "high",
    },
    {
      id: "6",
      title: "Complete Programming Project",
      completed: false,
      dueDate: "2025-05-22",
      subject: "Computer Science",
      priority: "high",
    },
  ])

  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id === taskId) {
            const newCompletedState = !task.completed

            // Instead of showing toast here, we'll return the updated task with a flag
            return {
              ...task,
              completed: newCompletedState,
              // Add a flag to indicate this task was just toggled
              justToggled: true,
            }
          }
          return task
        })

        return updatedTasks
      })
    },
    [toast],
  )

  // Add an effect to handle toast notifications after state updates
  useEffect(() => {
    // Find any task that was just toggled
    const justToggledTask = tasks.find((task) => task.justToggled === true)

    if (justToggledTask) {
      // Show the appropriate toast based on completion state
      if (justToggledTask.completed) {
        toast({
          title: "Task Completed",
          description: `You've completed: ${justToggledTask.title}`,
          variant: "success",
        })
      } else {
        toast({
          title: "Task Marked Incomplete",
          description: `You've marked "${justToggledTask.title}" as incomplete`,
          variant: "default",
        })
      }

      // Clear the flag by updating the tasks
      setTasks(tasks.map((task) => (task.id === justToggledTask.id ? { ...task, justToggled: undefined } : task)))
    }
  }, [tasks, toast])

  const handleEditTask = useCallback(
    (task: Task) => {
      toast({
        title: "Edit Task",
        description: `You're editing: ${task.title}`,
        variant: "default",
      })
    },
    [toast],
  )

  const handleSetReminder = useCallback(
    (task: Task) => {
      toast({
        title: "Reminder Set",
        description: `You'll be reminded about "${task.title}" before the due date`,
        variant: "info",
      })
    },
    [toast],
  )

  const handleAddToFocusSession = useCallback(
    (task: Task) => {
      toast({
        title: "Added to Focus Session",
        description: `"${task.title}" has been added to your next focus session`,
        variant: "success",
        action: <ToastAction altText="Start Session">Start Session</ToastAction>,
      })
    },
    [toast],
  )

  const handleDeleteTask = useCallback(
    (task: Task) => {
      // Remove the task from the state first
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id))

      // Then show toast (this is safe in an event handler)
      toast({
        title: "Task Deleted",
        description: `"${task.title}" has been deleted`,
        variant: "destructive",
      })
    },
    [toast],
  )

  const displayedTasks = limit ? tasks.slice(0, limit) : tasks

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs md:text-sm text-muted-foreground">
          {tasks.filter((task) => task.completed).length} of {tasks.length} tasks completed
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 md:h-8 gap-1 text-xs md:text-sm"
            onClick={() => {
              setIsAddTaskOpen(true)
              toast({
                title: "Add New Task",
                description: "Create a new task to track your progress",
                variant: "default",
              })
            }}
          >
            <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span>Add Task</span>
          </Button>
        </motion.div>
      </div>

      <motion.div className="space-y-2" variants={container} initial="hidden" animate="show">
        {displayedTasks.map((task) => (
          <motion.div key={task.id} variants={item}>
            <TaskItem
              task={task}
              onToggleCompletion={toggleTaskCompletion}
              onEditTask={handleEditTask}
              onSetReminder={handleSetReminder}
              onAddToFocusSession={handleAddToFocusSession}
              onDeleteTask={handleDeleteTask}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
})

export default TaskList
