"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

type AppContextType = {
  activeTab: string
  setActiveTab: (tab: string) => void
  autoStartFocusTimer: boolean
  setAutoStartFocusTimer: (start: boolean) => void
  isAddTaskOpen: boolean
  setIsAddTaskOpen: (open: boolean) => void
  handleStartFocusSession: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [autoStartFocusTimer, setAutoStartFocusTimer] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const { toast } = useToast()

  const handleStartFocusSession = useCallback(() => {
    setActiveTab("focus")
    setAutoStartFocusTimer(true)

    toast({
      title: "Focus Session Started",
      description: "Your focus session has begun. Stay focused!",
      variant: "success",
    })
  }, [toast])

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      autoStartFocusTimer,
      setAutoStartFocusTimer,
      isAddTaskOpen,
      setIsAddTaskOpen,
      handleStartFocusSession,
    }),
    [activeTab, autoStartFocusTimer, isAddTaskOpen, handleStartFocusSession],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
