"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type TabItem = {
  value: string
  label: string
  content: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, defaultValue, value, onValueChange, className }: AnimatedTabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue || tabs[0]?.value)

  React.useEffect(() => {
    if (value) {
      setSelectedTab(value)
    }
  }, [value])

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue)
    if (onValueChange) {
      onValueChange(tabValue)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative flex overflow-x-auto">
        <div className="flex border-b w-full">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium relative",
                selectedTab === tab.value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {selectedTab === tab.value && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="tab-indicator"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        {tabs.map((tab) => (
          <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: selectedTab === tab.value ? 1 : 0,
              y: selectedTab === tab.value ? 0 : 10,
              pointerEvents: selectedTab === tab.value ? "auto" : "none",
              position: selectedTab === tab.value ? "relative" : "absolute",
              zIndex: selectedTab === tab.value ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
