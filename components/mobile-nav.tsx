"use client"

import { useState, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Flame } from "lucide-react"
import { useAppContext } from "@/context/app-context"

const MobileNav = memo(function MobileNav() {
  const { activeTab, setActiveTab } = useAppContext()
  const [open, setOpen] = useState(false)

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      setOpen(false)
    },
    [setActiveTab],
  )

  const menuItems = [
    { name: "dashboard", label: "Dashboard" },
    { name: "tasks", label: "Tasks" },
    { name: "focus", label: "Focus" },
    { name: "social", label: "Social" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2 font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
              <span>StudyStreak</span>
            </motion.div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2">
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ x: 5 }}
                >
                  <Button
                    variant={activeTab === item.name ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleTabChange(item.name)}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
})

export default MobileNav
