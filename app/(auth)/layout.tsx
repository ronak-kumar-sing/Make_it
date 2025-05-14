import type { ReactNode } from "react"
import Link from "next/link"
import { Flame } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>StudyStreak</span>
        </Link>
        <ThemeToggle />
      </div>
      <main>{children}</main>
    </div>
  )
}
