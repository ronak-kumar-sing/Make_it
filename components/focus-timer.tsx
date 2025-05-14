"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipForward, Volume2, VolumeX, Coffee, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface TimerSettings {
  focus: number
  shortBreak: number
  longBreak: number
}

interface FocusTimerProps {
  autoStart?: boolean
  onStart?: () => void
}

const FocusTimer = memo(function FocusTimer({ autoStart = false, onStart }: FocusTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [settings, setSettings] = useState<TimerSettings>({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  })
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showTree, setShowTree] = useState(true)
  const [treeGrowth, setTreeGrowth] = useState(0)
  const isMobile = useIsMobile()

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (autoStart && !isActive) {
      setIsActive(true)
      if (onStart) onStart()
    }
  }, [autoStart, isActive, onStart])

  useEffect(() => {
    // Reset timer when mode changes
    switch (mode) {
      case "focus":
        setTimeLeft(settings.focus * 60)
        break
      case "shortBreak":
        setTimeLeft(settings.shortBreak * 60)
        break
      case "longBreak":
        setTimeLeft(settings.longBreak * 60)
        break
    }

    // Reset tree growth when switching to focus mode
    if (mode === "focus") {
      setTreeGrowth(0)
    }

    setIsActive(false)
  }, [mode, settings])

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            clearInterval(timerRef.current!)
            handleTimerComplete()
            return 0
          }

          // Update tree growth during focus sessions
          if (mode === "focus") {
            const totalTime = settings.focus * 60
            const percentComplete = 100 - ((prev - 1) / totalTime) * 100
            setTreeGrowth(percentComplete)
          }

          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, mode, settings])

  const handleTimerComplete = useCallback(() => {
    // Play sound
    if (!isMuted) {
      const audio = new Audio("/notification.mp3") // This would be a real sound file in a production app
      audio.volume = volume / 100
      audio.play().catch((e) => console.error("Error playing sound:", e))
    }

    if (mode === "focus") {
      setCompletedSessions((prev) => prev + 1)

      // After 4 focus sessions, take a long break
      if ((completedSessions + 1) % 4 === 0) {
        setMode("longBreak")
      } else {
        setMode("shortBreak")
      }
    } else {
      // After a break, go back to focus mode
      setMode("focus")
    }
  }, [completedSessions, isMuted, mode, volume])

  const toggleTimer = useCallback(() => {
    setIsActive((prev) => !prev)
  }, [])

  const skipTimer = useCallback(() => {
    if (mode === "focus") {
      setCompletedSessions((prev) => prev + 1)

      // After 4 focus sessions, take a long break
      if ((completedSessions + 1) % 4 === 0) {
        setMode("longBreak")
      } else {
        setMode("shortBreak")
      }
    } else {
      // After a break, go back to focus mode
      setMode("focus")
    }
  }, [completedSessions, mode])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const getProgressValue = useCallback(() => {
    let totalTime
    switch (mode) {
      case "focus":
        totalTime = settings.focus * 60
        break
      case "shortBreak":
        totalTime = settings.shortBreak * 60
        break
      case "longBreak":
        totalTime = settings.longBreak * 60
        break
    }
    return 100 - (timeLeft / totalTime) * 100
  }, [mode, settings, timeLeft])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return (
    <div className="space-y-4 md:space-y-6 dark:[--tree-brightness:1.2]">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          {!isActive && <TabsTrigger value="settings">Settings</TabsTrigger>}
          {isActive && (
            <TabsTrigger value="settings" disabled className="opacity-50">
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="timer" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <motion.div
              className={`w-full ${isActive ? "md:w-full min-h-[50vh] flex flex-col justify-center" : "md:w-1/2"} space-y-4 md:space-y-6 transition-all duration-500`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isActive ? 1.1 : 1,
                height: isActive ? "auto" : "auto",
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center space-x-1 md:space-x-2">
                <Button
                  variant={mode === "focus" ? "default" : "outline"}
                  onClick={() => setMode("focus")}
                  className="flex-1 text-xs md:text-sm px-2 md:px-3 transition-all duration-300"
                  disabled={isActive}
                >
                  <BookOpen className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Focus
                </Button>
                <Button
                  variant={mode === "shortBreak" ? "default" : "outline"}
                  onClick={() => setMode("shortBreak")}
                  className="flex-1 text-xs md:text-sm px-2 md:px-3 transition-all duration-300"
                  disabled={isActive}
                >
                  <Coffee className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Short Break
                </Button>
                <Button
                  variant={mode === "longBreak" ? "default" : "outline"}
                  onClick={() => setMode("longBreak")}
                  className="flex-1 text-xs md:text-sm px-2 md:px-3 transition-all duration-300"
                  disabled={isActive}
                >
                  <Coffee className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Long Break
                </Button>
              </div>

              <div className="text-center">
                <motion.div
                  className={`text-4xl md:text-6xl ${isActive ? "md:text-8xl" : ""} font-bold mb-2 md:mb-4 tabular-nums`}
                  key={timeLeft}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <Progress value={getProgressValue()} className="h-2 mb-4 md:mb-6 transition-all duration-300" />
                {isActive && (
                  <motion.div
                    className="fixed inset-0 bg-background/90 backdrop-blur-md z-10 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                <div className="flex justify-center space-x-2 md:space-x-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="default"
                      size={isMobile ? "default" : "lg"}
                      onClick={toggleTimer}
                      aria-pressed={isActive}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                    >
                      {isActive ? (
                        <Pause className="mr-1 md:mr-2 h-4 w-4" />
                      ) : (
                        <Play className="mr-1 md:mr-2 h-4 w-4" />
                      )}
                      {isActive ? "Pause" : "Start"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size={isMobile ? "default" : "lg"}
                      variant="outline"
                      onClick={skipTimer}
                      disabled={isActive}
                    >
                      <SkipForward className="mr-1 md:mr-2 h-4 w-4" />
                      Skip
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  disabled={isMuted}
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="w-24"
                />
              </div>
            </motion.div>

            {showTree && !isMobile && !isActive && (
              <motion.div
                className="w-full md:w-1/2 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <div className="absolute bottom-0 w-full flex justify-center">
                    <motion.div
                      className="w-12 md:w-16 bg-amber-800 dark:bg-amber-700 rounded-t-lg"
                      style={{ height: `${Math.max(10, treeGrowth / 5)}px` }}
                      animate={{ height: `${Math.max(10, treeGrowth / 5)}px` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <motion.div
                    className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
                    style={{
                      width: `${Math.max(20, treeGrowth)}px`,
                      height: `${Math.max(40, treeGrowth * 2)}px`,
                      borderRadius: "50%",
                      background:
                        mode === "focus"
                          ? `radial-gradient(circle, rgba(34,197,94,1) ${treeGrowth}%, rgba(22,163,74,1) 100%)`
                          : "radial-gradient(circle, rgba(34,197,94,1) 100%, rgba(22,163,74,1) 100%)",
                      opacity: mode === "focus" ? Math.max(0.3, treeGrowth / 100) : 1,
                      filter: "brightness(var(--tree-brightness, 1))",
                    }}
                    animate={{
                      width: `${Math.max(20, treeGrowth)}px`,
                      height: `${Math.max(40, treeGrowth * 2)}px`,
                      opacity: mode === "focus" ? Math.max(0.3, treeGrowth / 100) : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-3 md:p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm md:text-base">Today's Progress</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {completedSessions} {completedSessions === 1 ? "session" : "sessions"} completed
                  </p>
                </div>
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-2 h-2 md:w-3 md:h-3 rounded-full",
                        i < completedSessions % 4 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700",
                      )}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: i < completedSessions % 4 ? [1, 1.2, 1] : 1,
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        scale: { type: "spring", stiffness: 300 },
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Focus Duration (minutes)</label>
              <Slider
                value={[settings.focus]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, focus: value[0] }))}
              />
              <div className="text-sm text-right">{settings.focus} minutes</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Break Duration (minutes)</label>
              <Slider
                value={[settings.shortBreak]}
                min={1}
                max={15}
                step={1}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, shortBreak: value[0] }))}
              />
              <div className="text-sm text-right">{settings.shortBreak} minutes</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Long Break Duration (minutes)</label>
              <Slider
                value={[settings.longBreak]}
                min={5}
                max={30}
                step={5}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, longBreak: value[0] }))}
              />
              <div className="text-sm text-right">{settings.longBreak} minutes</div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-medium">Show Focus Tree</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTree}
                  onChange={() => setShowTree((prev) => !prev)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
})

export default FocusTimer
