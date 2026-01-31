import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logger"

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Remove auth cookie
    cookieStore.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })

    logger.info("User logged out")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    logger.error("Logout error", { error })
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
