"use client"

import type React from "react"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardDescription,
  AnimatedCardFooter,
  AnimatedCardHeader,
  AnimatedCardTitle,
} from "@/components/ui/animated-card"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Clock, Flame, Trophy, Moon, Sun, Laptop, Check } from "lucide-react"
import TaskList from "@/components/task-list"
import FocusTimer from "@/components/focus-timer"
import StreakCard from "@/components/streak-card"
import ChallengesList from "@/components/challenges-list"
import FriendsList from "@/components/friends-list"
import MobileNav from "@/components/mobile-nav"
import ChatInterface from "@/components/chat-interface"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { useAppContext } from "@/context/app-context"

// Memoized dashboard stat card
const DashboardStatCard = memo(function DashboardStatCard({
  title,
  icon,
  value,
  subtext,
  index,
}: {
  title: string
  icon: React.ReactNode
  value: string
  subtext: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
})

// Memoized header component
const DashboardHeader = memo(function DashboardHeader() {
  const { activeTab, handleStartFocusSession } = useAppContext()
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <motion.header
      className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <motion.div
            className="flex items-center gap-2 font-bold"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Flame className="h-5 w-5 text-orange-500" />
            <span>StudyStreak</span>
          </motion.div>
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-end space-x-1">
          {["dashboard", "tasks", "focus", "social"].map((tab, index) => (
            <motion.div
              key={tab}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={activeTab === tab ? "bg-muted" : ""}
                onClick={() => handleStartFocusSession()}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            </motion.div>
          ))}
        </nav>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-students-studying.png" alt="User" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Statistics</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </div>
                {resolvedTheme === "light" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </div>
                {resolvedTheme === "dark" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Laptop className="h-4 w-4 mr-2" />
                  System
                </div>
                {theme === "system" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.header>
  )
})

// Memoized add task dialog
const AddTaskDialog = memo(function AddTaskDialog() {
  const { isAddTaskOpen, setIsAddTaskOpen } = useAppContext()

  return (
    <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task to track your academic work.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">
              Title
            </Label>
            <Input id="task-title" placeholder="Enter task title" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-subject" className="text-right">
              Subject
            </Label>
            <Select>
              <SelectTrigger className="col-span-3" id="task-subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="literature">Literature</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-due-date" className="text-right">
              Due Date
            </Label>
            <Input id="task-due-date" type="date" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-priority" className="text-right">
              Priority
            </Label>
            <Select>
              <SelectTrigger className="col-span-3" id="task-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <AnimatedButton type="submit" onClick={() => setIsAddTaskOpen(false)}>
            Add Task
          </AnimatedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

// Dashboard content components
const DashboardContent = memo(function DashboardContent() {
  return (
    <div className="space-y-4">
      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[
          {
            title: "Today's Focus",
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            value: "2h 15m",
            subtext: "+20% from yesterday",
          },
          {
            title: "Tasks Completed",
            icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            value: "7/12",
            subtext: "3 due today",
          },
          {
            title: "Current Streak",
            icon: <Flame className="h-4 w-4 text-orange-500" />,
            value: "12 days",
            subtext: "Best: 21 days",
          },
          {
            title: "Active Challenges",
            icon: <Trophy className="h-4 w-4 text-muted-foreground" />,
            value: "3",
            subtext: "1 ending soon",
          },
        ].map((item, index) => (
          <DashboardStatCard
            key={item.title}
            title={item.title}
            icon={item.icon}
            value={item.value}
            subtext={item.subtext}
            index={index}
          />
        ))}
      </motion.div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard delay={0.2} className="col-span-1">
          <AnimatedCardHeader>
            <AnimatedCardTitle>Upcoming Tasks</AnimatedCardTitle>
            <AnimatedCardDescription>Your most urgent tasks</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <TaskList limit={5} />
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <AnimatedButton variant="outline" className="w-full" asChild>
              <Link href="/tasks">View All Tasks</Link>
            </AnimatedButton>
          </AnimatedCardFooter>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="col-span-1">
          <AnimatedCardHeader>
            <AnimatedCardTitle>Your Streak</AnimatedCardTitle>
            <AnimatedCardDescription>Keep up the momentum</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <StreakCard />
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <AnimatedButton variant="outline" className="w-full">
              View Streak History
            </AnimatedButton>
          </AnimatedCardFooter>
        </AnimatedCard>

        <AnimatedCard delay={0.4} className="col-span-1">
          <AnimatedCardHeader>
            <AnimatedCardTitle>Active Challenges</AnimatedCardTitle>
            <AnimatedCardDescription>Compete with friends</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <ChallengesList />
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <AnimatedButton variant="outline" className="w-full" asChild>
              <Link href="/challenges">View All Challenges</Link>
            </AnimatedButton>
          </AnimatedCardFooter>
        </AnimatedCard>
      </div>
    </div>
  )
})

const TasksContent = memo(function TasksContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Organize your assignments and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList />
        </CardContent>
        <CardFooter>
          <AnimatedButton onClick={() => {}}>Add New Task</AnimatedButton>
        </CardFooter>
      </Card>
    </motion.div>
  )
})

const FocusContent = memo(function FocusContent() {
  const { autoStartFocusTimer } = useAppContext()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Focus Timer</CardTitle>
          <CardDescription>Stay focused and build your streak</CardDescription>
        </CardHeader>
        <CardContent>
          <FocusTimer autoStart={autoStartFocusTimer} />
        </CardContent>
      </Card>
    </motion.div>
  )
})

const SocialContent = memo(function SocialContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AnimatedCard delay={0.1}>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Friends</AnimatedCardTitle>
            <AnimatedCardDescription>Connect with study partners</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <FriendsList />
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <AnimatedButton variant="outline">Find Friends</AnimatedButton>
          </AnimatedCardFooter>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Challenges</AnimatedCardTitle>
            <AnimatedCardDescription>Compete and stay motivated</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <ChallengesList />
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <AnimatedButton>Create Challenge</AnimatedButton>
          </AnimatedCardFooter>
        </AnimatedCard>
      </div>
    </motion.div>
  )
})

export default function Dashboard() {
  const { activeTab, setActiveTab, handleStartFocusSession } = useAppContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Create tab content for animated tabs
  const tabContent = [
    {
      value: "dashboard",
      label: "Dashboard",
      content: <DashboardContent />,
    },
    {
      value: "tasks",
      label: "Tasks",
      content: <TasksContent />,
    },
    {
      value: "focus",
      label: "Focus",
      content: <FocusContent />,
    },
    {
      value: "social",
      label: "Social",
      content: <SocialContent />,
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="container flex-1 py-6">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
            <p className="text-muted-foreground">
              Track your progress, maintain your streak, and connect with friends.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">12 Day Streak</span>
            </div>
            <AnimatedButton onClick={handleStartFocusSession}>Start Studying</AnimatedButton>
          </div>
        </motion.div>

        {mounted && <AnimatedTabs tabs={tabContent} value={activeTab} onValueChange={setActiveTab} />}
      </div>

      {/* Chat Interface */}
      <ChatInterface
        userName="Alex"
        onStartFocusSession={handleStartFocusSession}
        onViewWeeklyGoals={() => setActiveTab("dashboard")}
        onChallengeFriends={() => setActiveTab("social")}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog />
    </main>
  )
}
