import { z } from 'zod'

// ==================== AUTH VALIDATIONS ====================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional().default(false),
})

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Alias for API routes
export const registerSchema = signupSchema

// ==================== TASK VALIDATIONS ====================

export const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedTime: z.number().min(1).max(480).optional(), // max 8 hours
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export const updateTaskSchema = taskSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
})

// ==================== FOCUS SESSION VALIDATIONS ====================

export const focusSessionSchema = z.object({
  type: z.enum(['POMODORO', 'DEEP_WORK', 'CUSTOM']).default('POMODORO'),
  duration: z.number().min(1).max(240), // max 4 hours
  taskId: z.string().cuid().optional(),
  notes: z.string().max(1000).optional(),
})

// ==================== CHALLENGE VALIDATIONS ====================

export const challengeSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500).optional(),
  type: z.enum(['STUDY_TIME', 'TASK_COMPLETION', 'STREAK', 'CUSTOM']),
  goal: z.number().min(1, 'Goal must be at least 1'),
  unit: z.string().min(1).max(20),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isPublic: z.boolean().default(true),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// ==================== AI CHAT VALIDATIONS ====================

export const aiChatSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message too long'),
  conversationId: z.string().cuid().optional(),
  context: z.object({
    currentTask: z.string().optional(),
    studyGoal: z.string().optional(),
    timeAvailable: z.number().optional(),
  }).optional(),
})

// ==================== USER PREFERENCE VALIDATIONS ====================

export const userPreferenceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  focusDuration: z.number().min(5).max(120).default(25),
  shortBreakDuration: z.number().min(1).max(30).default(5),
  longBreakDuration: z.number().min(5).max(60).default(15),
  dailyGoal: z.number().min(15).max(720).default(120), // 15 min to 12 hours
  notificationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  aiPersonalization: z.boolean().default(true),
})

// ==================== PAGINATION & FILTERING ====================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const taskFilterSchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  search: z.string().max(100).optional(),
  tags: z.string().optional(), // comma-separated
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type FocusSessionInput = z.infer<typeof focusSessionSchema>
export type ChallengeInput = z.infer<typeof challengeSchema>
export type AIChatInput = z.infer<typeof aiChatSchema>
export type UserPreferenceInput = z.infer<typeof userPreferenceSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type TaskFilterInput = z.infer<typeof taskFilterSchema>
