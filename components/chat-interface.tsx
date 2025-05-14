"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Send, Smile, Paperclip, X, MessageSquare, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  sender: "system" | "user"
  timestamp: Date
  isQuickAction?: boolean
}

interface ChatInterfaceProps {
  userName?: string
  onStartFocusSession?: () => void
  onViewWeeklyGoals?: () => void
  onChallengeFriends?: () => void
}

export default function ChatInterface({
  userName = "Alex",
  onStartFocusSession,
  onViewWeeklyGoals,
  onChallengeFriends,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const { toast } = useToast()

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: `📚 Welcome to StudyStreak, ${userName}! Ready to crush today's tasks?\n\n**Quick Start:**\n1. Add your first task below\n2. Start a focus session\n3. Earn streak days\n\nNeed help? Just ask! How can I assist your study journey today?`,
      sender: "system",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [userName])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Show toast notification
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the assistant",
      variant: "default",
    })

    // Generate contextual follow-up
    setTimeout(() => {
      const followUpMessage: Message = {
        id: `follow-up-${Date.now()}`,
        content: `Nice! Want to:\n1. Set timer for this task?\n2. Share progress with study buddy?\n3. Add subtasks?`,
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, followUpMessage])

      // Show toast notification for assistant reply
      toast({
        title: "New Message",
        description: "StudyStreak Assistant has replied to your message",
        variant: "info",
      })
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    // Add user action as a message
    const actionMessage: Message = {
      id: Date.now().toString(),
      content: action,
      sender: "user",
      timestamp: new Date(),
      isQuickAction: true,
    }
    setMessages((prev) => [...prev, actionMessage])

    // Handle different actions
    switch (action) {
      case "Start 25-min Focus Session":
        if (onStartFocusSession) onStartFocusSession()
        setTimeout(() => {
          const responseMessage: Message = {
            id: `response-${Date.now()}`,
            content: "Focus session started! I'll help you stay on track for the next 25 minutes. You can do this! 💪",
            sender: "system",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, responseMessage])

          // Show toast notification
          toast({
            title: "Focus Session Started",
            description: "Your 25-minute focus session has begun",
            variant: "success",
            action: <ToastAction altText="View Timer">View Timer</ToastAction>,
          })
        }, 500)
        setIsOpen(false) // Close the chat interface
        break
      case "View Weekly Goals":
        if (onViewWeeklyGoals) onViewWeeklyGoals()
        setTimeout(() => {
          const responseMessage: Message = {
            id: `response-${Date.now()}`,
            content: "Here's your weekly progress! You've completed 65% of your goals so far. Keep up the great work!",
            sender: "system",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, responseMessage])

          // Show toast notification
          toast({
            title: "Weekly Goals",
            description: "You've completed 65% of your weekly goals",
            variant: "info",
          })
        }, 500)
        setIsOpen(false) // Close the chat interface
        break
      case "Challenge Friends":
        if (onChallengeFriends) onChallengeFriends()
        setTimeout(() => {
          const responseMessage: Message = {
            id: `response-${Date.now()}`,
            content:
              "🔥 Jamie just completed 3 tasks!\nKeep your streak alive by:\n[📚 Study Now] [🎯 Set New Goal] [💬 Cheer Them On]",
            sender: "system",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, responseMessage])

          // Show toast notification
          toast({
            title: "Challenge Created",
            description: "You've created a new study challenge with your friends",
            variant: "success",
            action: <ToastAction altText="View Challenge">View Challenge</ToastAction>,
          })
        }, 500)
        setIsOpen(false) // Close the chat interface
        break
      default:
        break
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format message content with markdown-like syntax
  const formatContent = (content: string) => {
    // Bold text
    const boldText = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')

    // Line breaks
    const withLineBreaks = boldText.replace(/\n/g, "<br />")

    return <div dangerouslySetInnerHTML={{ __html: withLineBreaks }} />
  }

  return (
    <>
      {/* Chat button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          onClick={() => {
            setIsOpen(true)
            toast({
              title: "Chat Opened",
              description: "You can now chat with the StudyStreak Assistant",
              variant: "default",
            })
          }}
          className="h-12 w-12 rounded-full bg-primary shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/diverse-students-studying.png" alt="StudyStreak Assistant" />
                        <AvatarFallback>SA</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-base">StudyStreak Assistant</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-foreground opacity-80 hover:opacity-100"
                      onClick={() => {
                        setIsOpen(false)
                        toast({
                          title: "Chat Closed",
                          description: "You can reopen the chat anytime",
                          variant: "default",
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                        >
                          {message.sender === "system" && (
                            <Avatar className="mr-2 mt-1 h-8 w-8 flex-shrink-0">
                              <AvatarImage src="/diverse-students-studying.png" alt="StudyStreak Assistant" />
                              <AvatarFallback>SA</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg px-3 py-2",
                              message.sender === "user"
                                ? message.isQuickAction
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-primary text-primary-foreground"
                                : "bg-muted",
                              message.sender === "user" ? "rounded-tr-none" : "rounded-tl-none",
                            )}
                          >
                            {formatContent(message.content)}
                            <div className="mt-1 text-right text-[10px] opacity-70">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 p-3 border-t">
                  <div className="flex w-full gap-2 overflow-x-auto pb-2 flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAction("Start 25-min Focus Session")}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Start 25-min Focus Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAction("View Weekly Goals")}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      View Weekly Goals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAction("Challenge Friends")}
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Challenge Friends
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your task or study goal here... (E.g.: 'Complete math homework - 45 mins')"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 rounded-full bg-primary text-primary-foreground"
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { ToastAction } from "@/components/ui/toast"
