"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export default function StreakCard() {
  const isMobile = useIsMobile()
  const [currentStreak] = useState(12)
  const [bestStreak] = useState(21)
  const [weeklyActivity] = useState([
    { day: "Mon", active: true },
    { day: "Tue", active: true },
    { day: "Wed", active: true },
    { day: "Thu", active: true },
    { day: "Fri", active: true },
    { day: "Sat", active: true },
    { day: "Sun", active: true },
    { day: "Mon", active: true },
    { day: "Tue", active: true },
    { day: "Wed", active: true },
    { day: "Thu", active: true },
    { day: "Fri", active: true },
    { day: "Sat", active: false },
    { day: "Sun", active: false },
  ])

  // For mobile, show fewer days
  const displayedActivity = isMobile ? weeklyActivity.slice(-7) : weeklyActivity

  return (
    <motion.div
      className="space-y-3 md:space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center justify-center space-x-3 md:space-x-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="text-muted stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
            <motion.circle
              className="text-orange-500 dark:text-orange-400 stroke-current"
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - currentStreak / 30) }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          >
            <Flame className="h-6 w-6 md:h-10 md:w-10 text-orange-500 dark:text-orange-400" />
          </motion.div>
        </div>

        <div>
          <div className="text-2xl md:text-3xl font-bold">{currentStreak}</div>
          <div className="text-xs md:text-sm text-muted-foreground">day streak</div>
          <div className="text-xs md:text-sm">Best: {bestStreak} days</div>
        </div>
      </motion.div>

      <div className="space-y-1 md:space-y-2">
        <div className="text-xs md:text-sm font-medium">Recent Activity</div>
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {displayedActivity.map((day, index) => (
            <div key={index} className="flex flex-col items-center space-y-1 min-w-8 md:min-w-10">
              <div
                className={cn(
                  "w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center",
                  day.active
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {day.active && <Flame className="h-3 w-3 md:h-4 md:w-4" />}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">{day.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1 md:space-y-2">
        <div className="text-xs md:text-sm font-medium">Streak Milestones</div>
        <div className="relative pt-4">
          <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-muted rounded-full">
            <div
              className="absolute top-0 left-0 h-1.5 md:h-2 bg-orange-500 dark:bg-orange-400 rounded-full"
              style={{ width: `${(currentStreak / 30) * 100}%` }}
            />
            {[7, 14, 21, 30].map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "absolute top-0 w-3 h-3 md:w-4 md:h-4 rounded-full transform -translate-x-1/2 -translate-y-1/4",
                  currentStreak >= milestone ? "bg-orange-500 dark:bg-orange-400" : "bg-muted-foreground",
                )}
                style={{ left: `${(milestone / 30) * 100}%` }}
              >
                <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="text-[10px] md:text-xs font-medium">{milestone} days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
