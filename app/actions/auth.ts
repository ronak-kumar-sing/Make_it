"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

interface TokenPayload {
  userId: string
  email: string
  name: string
}

function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const remember = formData.get("remember") === "on"

  // Validate inputs
  if (!email) {
    return { error: "Email is required" }
  }

  if (!password) {
    return { error: "Password is required" }
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name || "User",
    })

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login. Please try again." }
  }
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const acceptTerms = formData.get("acceptTerms") === "on"

  // Validate inputs
  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" }
  }

  if (!email) {
    return { error: "Email is required" }
  }

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (!acceptTerms) {
    return { error: "You must accept the terms and conditions" }
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with preferences
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        preferences: {
          create: {
            theme: "system",
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            dailyGoal: 120,
            notificationsEnabled: true,
            soundEnabled: true,
            reducedMotion: false,
            aiPersonalization: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name || "User",
    })

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An error occurred during signup. Please try again." }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  redirect("/")
}

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  try {
    const payload = verifyToken(token.value)
    
    if (!payload) {
      return null
    }

    // Optionally fetch fresh user data from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        currentStreak: true,
        longestStreak: true,
        totalStudyTime: true,
        completedTasks: true,
        experiencePoints: true,
        level: true,
      },
    })

    return user
  } catch (error) {
    console.error("Failed to get user:", error)
    return null
  }
}

export async function getUserWithDetails() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  try {
    const payload = verifyToken(token.value)
    
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        preferences: true,
        tasks: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          orderBy: { dueDate: 'asc' },
          take: 5,
        },
        focusSessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error("Failed to get user with details:", error)
    return null
  }
}
