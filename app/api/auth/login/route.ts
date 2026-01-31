import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/security"
import { loginSchema } from "@/lib/validations"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        avatar: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        level: true,
        experience: true,
      },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      logger.warn("Failed login attempt", { email: email.toLowerCase() })
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    logger.info("User logged in successfully", { userId: user.id })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalFocusTime: user.totalFocusTime,
        level: user.level,
        experience: user.experience,
      },
    })
  } catch (error) {
    logger.error("Login error", { error })
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}
