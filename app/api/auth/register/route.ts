import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/security"
import { registerSchema } from "@/lib/validations"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        preferences: {
          create: {
            theme: "system",
            focusDuration: 25,
            breakDuration: 5,
            dailyGoal: 8,
            notifications: true,
            soundEnabled: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: "user",
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

    logger.info("User registered successfully", { userId: user.id })

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Registration error", { error })
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
