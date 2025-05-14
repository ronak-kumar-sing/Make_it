"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// This would connect to your actual auth provider in production
const MOCK_USERS = new Map()

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

  // Simulate server delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, you would validate credentials against your database
  // For demo purposes, we'll check if the user exists in our mock database
  const user = MOCK_USERS.get(email)

  if (!user || user.password !== password) {
    return { error: "Invalid email or password" }
  }

  // Set authentication cookie
  const cookieStore = cookies()
  cookieStore.set("auth-token", JSON.stringify({ email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
    path: "/",
  })

  return { success: true }
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const acceptTerms = formData.get("acceptTerms") === "on"

  // Validate inputs
  if (!name) {
    return { error: "Name is required" }
  }

  if (!email) {
    return { error: "Email is required" }
  }

  if (!password) {
    return { error: "Password is required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (!acceptTerms) {
    return { error: "You must accept the terms and conditions" }
  }

  // Simulate server delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user already exists
  if (MOCK_USERS.has(email)) {
    return { error: "User with this email already exists" }
  }

  // In a real app, you would hash the password and store in your database
  MOCK_USERS.set(email, { name, password })

  // Set authentication cookie
  const cookieStore = cookies()
  cookieStore.set("auth-token", JSON.stringify({ email, name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
  redirect("/")
}

export async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  try {
    const user = JSON.parse(token.value)
    return user
  } catch (error) {
    console.error("Failed to parse user from cookie", error)
    return null
  }
}
