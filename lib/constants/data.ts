// Constant data for the application - no database required

export const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@studystreak.app",
  name: "Demo User",
  image: null,
  currentStreak: 12,
  longestStreak: 25,
  totalStudyTime: 3650,
  totalTasks: 48,
  completedTasks: 42,
  experiencePoints: 2450,
  level: 8,
  createdAt: "2025-12-01T00:00:00.000Z",
}

export const DEMO_TASKS = [
  {
    id: "task-001",
    title: "Complete React Tutorial Chapter 5",
    description: "Learn about React hooks and state management",
    status: "COMPLETED",
    priority: "HIGH",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 60,
    actualTime: 55,
    tags: ["react", "frontend", "learning"],
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-002",
    title: "Study Database Design Patterns",
    description: "Review normalization and indexing strategies",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 90,
    tags: ["database", "backend"],
  },
  {
    id: "task-003",
    title: "Practice Algorithm Problems",
    description: "Solve 5 LeetCode medium problems",
    status: "PENDING",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 120,
    tags: ["algorithms", "interview-prep"],
  },
  {
    id: "task-004",
    title: "Read Clean Code Chapter 3",
    description: "Functions and how to write them well",
    status: "PENDING",
    priority: "LOW",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 45,
    tags: ["reading", "best-practices"],
  },
  {
    id: "task-005",
    title: "Build Portfolio Project",
    description: "Create a full-stack app with Next.js and MongoDB",
    status: "IN_PROGRESS",
    priority: "URGENT",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 480,
    tags: ["project", "portfolio", "fullstack"],
  },
]

export const DEMO_FOCUS_SESSIONS = [
  { id: "session-001", duration: 25, type: "POMODORO", completed: true, date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "session-002", duration: 50, type: "DEEP_WORK", completed: true, date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "session-003", duration: 25, type: "POMODORO", completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "session-004", duration: 25, type: "POMODORO", completed: false, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "session-005", duration: 45, type: "DEEP_WORK", completed: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
]

export const DEMO_ACHIEVEMENTS = [
  {
    id: "ach-001",
    name: "First Steps",
    description: "Complete your first study session",
    icon: "🎯",
    category: "SPECIAL",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach-002",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "STREAK",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach-003",
    name: "Focus Master",
    description: "Complete 50 focus sessions",
    icon: "🧘",
    category: "STUDY_TIME",
    unlocked: false,
  },
  {
    id: "ach-004",
    name: "Task Crusher",
    description: "Complete 100 tasks",
    icon: "✅",
    category: "TASKS",
    unlocked: false,
  },
]

export const DEMO_FRIENDS = [
  { id: "friend-001", name: "Alice Johnson", streak: 8, level: 5, image: null },
  { id: "friend-002", name: "Bob Smith", streak: 3, level: 3, image: null },
  { id: "friend-003", name: "Carol Williams", streak: 21, level: 12, image: null },
]

export const DEMO_CHALLENGES = [
  {
    id: "challenge-001",
    title: "January Study Sprint",
    description: "Study for 50 hours this month and earn bonus XP!",
    type: "STUDY_TIME",
    goal: 3000,
    unit: "minutes",
    progress: 2450,
    participants: 156,
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "challenge-002",
    title: "Task Master",
    description: "Complete 20 tasks this week",
    type: "TASK_COMPLETION",
    goal: 20,
    unit: "tasks",
    progress: 12,
    participants: 89,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_ANALYTICS = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  studyMinutes: 30 + Math.floor(Math.random() * 150),
  tasksCompleted: Math.floor(Math.random() * 5),
  focusSessions: 1 + Math.floor(Math.random() * 4),
  streakDay: i < 12,
}))

export const FEATURES = [
  {
    icon: "Flame",
    title: "Streak Tracking",
    description: "Build consistent study habits with our streak system. Stay motivated and track your daily progress.",
    gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
  },
  {
    icon: "Clock",
    title: "Focus Timer",
    description: "Pomodoro and deep work sessions to maximize your productivity and minimize burnout.",
    gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: "Brain",
    title: "AI Study Assistant",
    description: "Get personalized study plans and instant help from our AI-powered study buddy.",
    gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
  },
  {
    icon: "Users",
    title: "Social Learning",
    description: "Study with friends, join challenges, and compete on leaderboards.",
    gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
  },
  {
    icon: "Trophy",
    title: "Achievements",
    description: "Unlock achievements, earn XP, and level up as you reach your study goals.",
    gradient: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
  },
  {
    icon: "Target",
    title: "Goal Setting",
    description: "Set daily, weekly, and monthly goals. Track progress and celebrate wins.",
    gradient: "bg-gradient-to-br from-rose-500/20 to-red-500/20",
  },
]

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    image: "/testimonials/sarah.jpg",
    content: "StudyStreak transformed my study habits. I went from inconsistent cramming to daily focused sessions. My grades improved by 20%!",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Software Engineer",
    image: "/testimonials/james.jpg",
    content: "The AI assistant is incredible. It helps me plan my learning path and keeps me accountable. Best productivity app I've used.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Law Student",
    image: "/testimonials/emily.jpg",
    content: "The streak system is addictive in the best way. I'm on a 45-day streak now and I've never been more consistent with studying.",
    rating: 5,
  },
]

export const STATS = [
  { value: "10K+", label: "Active Students" },
  { value: "2M+", label: "Study Hours" },
  { value: "500K+", label: "Tasks Completed" },
  { value: "98%", label: "Success Rate" },
]

export const PRICING = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "Basic focus timer",
      "Streak tracking",
      "Up to 10 tasks",
      "Basic analytics",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 9.99,
    description: "For serious students",
    features: [
      "Everything in Free",
      "Unlimited tasks",
      "AI Study Assistant",
      "Advanced analytics",
      "Social features",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: 19.99,
    description: "For study groups",
    features: [
      "Everything in Pro",
      "Team challenges",
      "Group analytics",
      "Admin dashboard",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]
