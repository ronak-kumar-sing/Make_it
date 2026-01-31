import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Demo user credentials
export const DEMO_USER = {
  email: 'demo@studystreak.app',
  password: 'Demo@123456',
  name: 'Demo User',
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.aIMessage.deleteMany()
  await prisma.aIConversation.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.challengeParticipant.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.focusSession.deleteMany()
  await prisma.task.deleteMany()
  await prisma.friendship.deleteMany()
  await prisma.userAnalytics.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.achievement.deleteMany()

  // Create achievements
  console.log('🏆 Creating achievements...')
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎯',
        category: 'SPECIAL',
        requirement: 1,
        xpReward: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'STREAK',
        requirement: 7,
        xpReward: 200,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Focus Master',
        description: 'Complete 50 focus sessions',
        icon: '🧘',
        category: 'STUDY_TIME',
        requirement: 50,
        xpReward: 500,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Task Crusher',
        description: 'Complete 100 tasks',
        icon: '✅',
        category: 'TASKS',
        requirement: 100,
        xpReward: 300,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Social Butterfly',
        description: 'Add 5 study buddies',
        icon: '🦋',
        category: 'SOCIAL',
        requirement: 5,
        xpReward: 150,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Marathon Learner',
        description: 'Study for 1000 minutes total',
        icon: '🏃',
        category: 'STUDY_TIME',
        requirement: 1000,
        xpReward: 1000,
      },
    }),
  ])

  // Create demo user
  console.log('👤 Creating demo user...')
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12)
  
  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      password: hashedPassword,
      name: DEMO_USER.name,
      role: 'USER',
      currentStreak: 12,
      longestStreak: 25,
      totalStudyTime: 3650, // minutes
      totalTasks: 48,
      completedTasks: 42,
      experiencePoints: 2450,
      level: 8,
      preferences: {
        create: {
          theme: 'system',
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
  })

  // Create additional test users
  console.log('👥 Creating test users...')
  const testUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice Johnson',
        currentStreak: 8,
        longestStreak: 15,
        totalStudyTime: 2100,
        completedTasks: 28,
        experiencePoints: 1200,
        level: 5,
        preferences: { create: {} },
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        name: 'Bob Smith',
        currentStreak: 3,
        longestStreak: 10,
        totalStudyTime: 980,
        completedTasks: 15,
        experiencePoints: 650,
        level: 3,
        preferences: { create: {} },
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        password: hashedPassword,
        name: 'Carol Williams',
        currentStreak: 21,
        longestStreak: 45,
        totalStudyTime: 5200,
        completedTasks: 89,
        experiencePoints: 4500,
        level: 12,
        preferences: { create: {} },
      },
    }),
  ])

  // Create tasks for demo user
  console.log('📝 Creating tasks...')
  const today = new Date()
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Complete React Tutorial Chapter 5',
        description: 'Learn about React hooks and state management',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        estimatedTime: 60,
        actualTime: 55,
        tags: ['react', 'frontend', 'learning'],
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Study Database Design Patterns',
        description: 'Review normalization and indexing strategies',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        estimatedTime: 90,
        tags: ['database', 'backend'],
      },
    }),
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Practice Algorithm Problems',
        description: 'Solve 5 LeetCode medium problems',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        estimatedTime: 120,
        tags: ['algorithms', 'interview-prep'],
      },
    }),
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Read Clean Code Chapter 3',
        description: 'Functions and how to write them well',
        status: 'PENDING',
        priority: 'LOW',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        estimatedTime: 45,
        tags: ['reading', 'best-practices'],
      },
    }),
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Build Portfolio Project',
        description: 'Create a full-stack app with Next.js and MongoDB',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        estimatedTime: 480,
        tags: ['project', 'portfolio', 'fullstack'],
      },
    }),
  ])

  // Create focus sessions for demo user
  console.log('⏱️ Creating focus sessions...')
  const focusSessions = []
  for (let i = 0; i < 15; i++) {
    const startTime = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    startTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60))
    
    const duration = [25, 25, 50, 25, 45][Math.floor(Math.random() * 5)]
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)
    
    focusSessions.push(
      prisma.focusSession.create({
        data: {
          userId: demoUser.id,
          taskId: tasks[Math.floor(Math.random() * tasks.length)].id,
          startTime,
          endTime,
          duration,
          type: ['POMODORO', 'DEEP_WORK', 'POMODORO'][Math.floor(Math.random() * 3)] as 'POMODORO' | 'DEEP_WORK' | 'CUSTOM',
          completed: Math.random() > 0.1,
          notes: i % 3 === 0 ? 'Great focus session! Made good progress.' : null,
        },
      })
    )
  }
  await Promise.all(focusSessions)

  // Create challenges
  console.log('🏅 Creating challenges...')
  const challenge = await prisma.challenge.create({
    data: {
      title: 'January Study Sprint',
      description: 'Study for 50 hours this month and earn bonus XP!',
      type: 'STUDY_TIME',
      goal: 3000, // 50 hours in minutes
      unit: 'minutes',
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      isPublic: true,
      creatorId: demoUser.id,
    },
  })

  // Add participants to challenge
  await Promise.all([
    prisma.challengeParticipant.create({
      data: {
        userId: demoUser.id,
        challengeId: challenge.id,
        progress: 2450,
      },
    }),
    prisma.challengeParticipant.create({
      data: {
        userId: testUsers[0].id,
        challengeId: challenge.id,
        progress: 1800,
      },
    }),
    prisma.challengeParticipant.create({
      data: {
        userId: testUsers[2].id,
        challengeId: challenge.id,
        progress: 2900,
      },
    }),
  ])

  // Create friendships
  console.log('🤝 Creating friendships...')
  await Promise.all([
    prisma.friendship.create({
      data: {
        userId: demoUser.id,
        friendId: testUsers[0].id,
        status: 'ACCEPTED',
      },
    }),
    prisma.friendship.create({
      data: {
        userId: demoUser.id,
        friendId: testUsers[2].id,
        status: 'ACCEPTED',
      },
    }),
    prisma.friendship.create({
      data: {
        userId: testUsers[1].id,
        friendId: demoUser.id,
        status: 'PENDING',
      },
    }),
  ])

  // Award achievements to demo user
  console.log('🎖️ Awarding achievements...')
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: demoUser.id,
        achievementId: achievements[0].id, // First Steps
        unlockedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: demoUser.id,
        achievementId: achievements[1].id, // Week Warrior
        unlockedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create user analytics for the past 14 days
  console.log('📊 Creating analytics data...')
  const analyticsPromises = []
  for (let i = 0; i < 14; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    date.setHours(0, 0, 0, 0)
    
    analyticsPromises.push(
      prisma.userAnalytics.create({
        data: {
          userId: demoUser.id,
          date,
          studyMinutes: 30 + Math.floor(Math.random() * 150),
          tasksCompleted: Math.floor(Math.random() * 5),
          focusSessions: 1 + Math.floor(Math.random() * 4),
          streakDay: i < 12, // Last 12 days have streak
        },
      })
    )
  }
  await Promise.all(analyticsPromises)

  // Create AI conversation
  console.log('🤖 Creating AI conversation...')
  const conversation = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      title: 'Study Planning Help',
      messages: {
        create: [
          {
            role: 'USER',
            content: 'Can you help me create a study plan for learning React?',
          },
          {
            role: 'ASSISTANT',
            content: `Of course! 🎯 Here's a structured plan for learning React:

**Week 1-2: Fundamentals**
- JavaScript ES6+ features (destructuring, arrow functions, modules)
- React basics: Components, JSX, Props

**Week 3-4: State & Hooks**
- useState and useEffect
- Custom hooks
- Context API

**Week 5-6: Advanced Patterns**
- React Router
- State management (Redux or Zustand)
- Performance optimization

I recommend 2-3 hours daily with 25-minute Pomodoro sessions. Want me to break this down further?`,
          },
        ],
      },
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📧 Demo Login Credentials:')
  console.log(`   Email: ${DEMO_USER.email}`)
  console.log(`   Password: ${DEMO_USER.password}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
