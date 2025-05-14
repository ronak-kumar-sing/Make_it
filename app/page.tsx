import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Flame, Users, Trophy, ArrowRight, CheckCircle2, Clock, BookOpen, Target, Star } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  // Check if user is authenticated
  const user = await getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  // For non-authenticated users, render the marketing page content directly
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-lg">StudyStreak</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-orange-200 to-orange-400 opacity-20 dark:opacity-10"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-sm text-orange-600 dark:text-orange-400 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                New: Group Study Challenges
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Build Your Study Habit, <span className="text-orange-500">One Streak</span> at a Time
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8">
                StudyStreak helps students stay focused, track progress, and build consistent study habits through
                gamified productivity tools and social accountability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                  <Link href="/signup">
                    Start for free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-6 text-sm">
                <div className="flex -space-x-2">
                  {[
                    "/diverse-students-studying.png",
                    "/abstract-geometric-pattern.png",
                    "/singer-songwriter.png",
                    "/jordan-landscape.png",
                  ].map((src, i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                      <Image
                        src={src || "/placeholder.svg"}
                        alt="User"
                        width={32}
                        height={32}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span> students already joined
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-lg blur-md opacity-30"></div>
              <div className="relative bg-background rounded-lg border overflow-hidden shadow-xl">
                <Image
                  src="/diverse-students-studying.png"
                  alt="StudyStreak Dashboard"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg flex items-end">
                  <div className="p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="font-bold">12-Day Streak</span>
                    </div>
                    <p className="text-sm text-white/80">Keep going! You're building a great study habit.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Today's Goal</p>
                    <p className="text-xs text-muted-foreground">2 hours completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6">TRUSTED BY STUDENTS FROM</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 grayscale opacity-70">
            {["Harvard", "Stanford", "MIT", "Oxford", "Cambridge", "Yale"].map((university, index) => (
              <div key={index} className="flex items-center">
                <span className="text-xl font-serif font-bold">{university}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to excel in your studies</h2>
            <p className="text-xl text-muted-foreground">
              StudyStreak combines focus tools, habit tracking, and social accountability to help you achieve your
              academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-10 w-10 text-orange-500" />,
                title: "Focus Timer",
                description:
                  "Customizable Pomodoro timer with break reminders to maximize your productivity and prevent burnout.",
              },
              {
                icon: <Flame className="h-10 w-10 text-orange-500" />,
                title: "Daily Streaks",
                description:
                  "Build consistent study habits by maintaining your streak and watching your progress grow day by day.",
              },
              {
                icon: <Target className="h-10 w-10 text-orange-500" />,
                title: "Smart Goals",
                description:
                  "Set and track SMART goals for your courses, projects, and exams with progress visualization.",
              },
              {
                icon: <Users className="h-10 w-10 text-orange-500" />,
                title: "Social Challenges",
                description:
                  "Create and join study challenges with friends to stay motivated through friendly competition.",
              },
              {
                icon: <BookOpen className="h-10 w-10 text-orange-500" />,
                title: "Subject Tracking",
                description:
                  "Organize your study sessions by subject to ensure balanced preparation across all your courses.",
              },
              {
                icon: <Trophy className="h-10 w-10 text-orange-500" />,
                title: "Achievements",
                description: "Earn badges and rewards as you reach milestones and develop stronger study habits.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How StudyStreak works</h2>
            <p className="text-xl text-muted-foreground">
              Our proven system helps you build consistent study habits in just three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Set your goals",
                description:
                  "Define what you want to achieve, whether it's daily study hours, completing assignments, or mastering specific topics.",
                image: "/diverse-group-meeting.png",
              },
              {
                step: "02",
                title: "Track your progress",
                description:
                  "Use our focus timer to stay on task and build your streak by studying consistently day after day.",
                image: "/abstract-geometric-pattern.png",
              },
              {
                step: "03",
                title: "Stay accountable",
                description:
                  "Join challenges with friends or study groups to maintain motivation through social accountability.",
                image: "/singer-songwriter.png",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full blur-md opacity-30"></div>
                  <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-background">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="absolute -right-2 -bottom-2 bg-orange-500 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href="/signup">
                Start your journey <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by students worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See how StudyStreak has helped thousands of students improve their study habits and academic performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "StudyStreak completely transformed my study habits. I went from procrastinating to maintaining a 45-day streak, and my grades have improved significantly!",
                name: "Jamie Chen",
                role: "Computer Science Student",
                avatar: "/abstract-geometric-pattern.png",
                rating: 5,
              },
              {
                quote:
                  "The social challenges feature keeps me accountable. Studying with friends remotely feels like we're all in the library together, even when we're miles apart.",
                name: "Taylor Kim",
                role: "Biology Major",
                avatar: "/singer-songwriter.png",
                rating: 5,
              },
              {
                quote:
                  "As someone with ADHD, focusing has always been a challenge. The Pomodoro timer and streak system give me the structure I need to stay on track with my studies.",
                name: "Jordan Smith",
                role: "Engineering Student",
                avatar: "/jordan-landscape.png",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-muted/30 rounded-xl border p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="flex-grow mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-orange-50 dark:bg-orange-950/20 rounded-xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">Join our community</p>
                <p className="text-muted-foreground">
                  Connect with 10,000+ students using StudyStreak - 100% free for everyone!
                </p>
              </div>
            </div>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap" asChild>
              <Link href="/signup">
                Sign up now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about StudyStreak</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How does the streak system work?",
                answer:
                  "StudyStreak counts each day you complete your minimum study goal as part of your streak. If you miss a day, your streak resets to zero. The app sends reminders to help you maintain your streak and build consistent study habits over time.",
              },
              {
                question: "Can I use StudyStreak with my study group?",
                answer:
                  "Our Team plan allows up to 10 members to collaborate, create shared challenges, and track group progress. It's perfect for study groups, project teams, or classmates preparing for the same exams.",
              },
              {
                question: "Is there a mobile app available?",
                answer:
                  "Yes, StudyStreak is available on iOS and Android, with full synchronization between web and mobile versions. You can track your study sessions and maintain your streak wherever you are.",
              },
              {
                question: "How does the focus timer work?",
                answer:
                  "Our focus timer is based on the Pomodoro Technique, with customizable work and break intervals. You can adjust the duration to match your concentration span, and the app will track your total focused study time.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your paid features until the end of your billing period, after which you'll be downgraded to the free plan.",
              },
            ].map((item, index) => (
              <div key={index} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" asChild>
              <Link href="#">Contact our support team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-orange-50 dark:bg-orange-950/20">
        <div className="container max-w-5xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your study habits?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of students who are achieving their academic goals with StudyStreak - completely free for
            everyone!
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8" asChild>
            <Link href="/signup">
              Get started now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 max-w-2xl mx-auto">
            {["100% Free", "All features included", "No credit card required"].map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-bold mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>StudyStreak</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-xs">
                Helping students build consistent study habits and achieve academic success through focus and
                accountability.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "github"].map((social) => (
                  <a key={social} href="#" className="text-muted-foreground hover:text-foreground">
                    <span className="sr-only">{social}</span>
                    <div className="h-6 w-6 bg-muted rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "FAQ", "Roadmap"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                {["About", "Team", "Careers", "Blog", "Press"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                {["Terms", "Privacy", "Cookies", "Licenses", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StudyStreak. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
