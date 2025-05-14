"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, MoreHorizontal, Flame, Clock, BookOpen, Send, X, Paperclip, Smile } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

interface Friend {
  id: string
  name: string
  avatar: string
  status: "online" | "studying" | "break" | "offline"
  streak: number
  subject?: string
  lastActive?: string
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function FriendsList() {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const [friends] = useState<Friend[]>([
    {
      id: "1",
      name: "Jamie Chen",
      avatar: "/abstract-geometric-pattern.png",
      status: "studying",
      streak: 15,
      subject: "Physics",
    },
    {
      id: "2",
      name: "Taylor Kim",
      avatar: "/singer-songwriter.png",
      status: "online",
      streak: 8,
      lastActive: "Just now",
    },
    {
      id: "3",
      name: "Jordan Smith",
      avatar: "/jordan-landscape.png",
      status: "studying",
      streak: 21,
      subject: "Mathematics",
    },
    {
      id: "4",
      name: "Morgan Lee",
      avatar: "/placeholder.svg?key=3kv25",
      status: "break",
      streak: 12,
      lastActive: "5 min ago",
    },
    {
      id: "5",
      name: "Casey Wilson",
      avatar: "/abstract-casey.png",
      status: "offline",
      streak: 5,
      lastActive: "2 hours ago",
    },
  ])

  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "friend"; timestamp: Date }[]>([
    { id: "1", text: "Hey, how's your study going?", sender: "friend", timestamp: new Date(Date.now() - 3600000) },
    {
      id: "2",
      text: "I'm working on my math assignment. Almost done!",
      sender: "user",
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: "3",
      text: "That's great! I'm struggling with physics 😓",
      sender: "friend",
      timestamp: new Date(Date.now() - 3400000),
    },
    {
      id: "4",
      text: "Maybe we can study together tomorrow?",
      sender: "friend",
      timestamp: new Date(Date.now() - 3300000),
    },
    {
      id: "5",
      text: "Let's meet at the library at 3pm",
      sender: "user",
      timestamp: new Date(Date.now() - 3200000),
    },
    { id: "6", text: "Perfect! See you then 👍", sender: "friend", timestamp: new Date(Date.now() - 3100000) },
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim()) return

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ])
    setNewMessage("")

    // Show toast notification
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${activeChatFriend?.name}`,
      variant: "success",
    })

    // Simulate friend reply after a short delay
    setTimeout(() => {
      const replies = [
        "That sounds good!",
        "I'll check my schedule and get back to you.",
        "Can we discuss this during our study session?",
        "Thanks for letting me know!",
        "I'm working on that assignment too!",
        "Have you completed the reading for tomorrow?",
      ]

      const replyText = replies[Math.floor(Math.random() * replies.length)]

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: replyText,
          sender: "friend",
          timestamp: new Date(),
        },
      ])

      // Show toast notification for new message
      toast({
        title: "New Message",
        description: `${activeChatFriend?.name}: ${replyText}`,
        variant: "info",
      })
    }, 2000)
  }

  const handleAddFriend = () => {
    toast({
      title: "Friend Request Sent",
      description: "Your friend request has been sent successfully!",
      variant: "success",
    })
  }

  const handleViewProfile = (friend: Friend) => {
    toast({
      title: "Profile Viewed",
      description: `You are viewing ${friend.name}'s profile`,
      variant: "default",
    })
  }

  const handleStartChallenge = (friend: Friend) => {
    toast({
      title: "Challenge Started",
      description: `You've started a study challenge with ${friend.name}!`,
      variant: "success",
      action: <ToastAction altText="View Challenge">View Challenge</ToastAction>,
    })
  }

  const handleStudyTogether = (friend: Friend) => {
    toast({
      title: "Study Session Created",
      description: `You've created a study session with ${friend.name}!`,
      variant: "success",
      action: <ToastAction altText="Join Session">Join Session</ToastAction>,
    })
  }

  const handleRemoveFriend = (friend: Friend) => {
    toast({
      title: "Friend Removed",
      description: `${friend.name} has been removed from your friends list`,
      variant: "destructive",
    })
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "studying":
        return "bg-purple-500"
      case "break":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case "online":
        return "Online"
      case "studying":
        return `Studying ${friend.subject}`
      case "break":
        return "On a break"
      case "offline":
        return `Last active ${friend.lastActive}`
      default:
        return "Offline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return null
      case "studying":
        return <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
      case "break":
        return <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
      case "offline":
        return null
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {
            friends.filter(
              (friend) => friend.status === "online" || friend.status === "studying" || friend.status === "break",
            ).length
          }{" "}
          online
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleAddFriend}>
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Friend</span>
          </Button>
        </motion.div>
      </div>

      <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
        {friends.map((friend) => (
          <motion.div
            key={friend.id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <motion.span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(friend.status)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                />
              </div>
              <div>
                <div className="font-medium">{friend.name}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getStatusIcon(friend.status)}
                  <span>{getStatusText(friend)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {friend.streak > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  <Flame className="h-3 w-3" />
                  <span>{friend.streak}</span>
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleViewProfile(friend)}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStartChallenge(friend)}>Start Challenge</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStudyTogether(friend)}>Study Together</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveChatFriend(friend)}>Send Message</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveFriend(friend)}>
                    Remove Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* WhatsApp-inspired Chat Dialog */}
      <Dialog open={!!activeChatFriend} onOpenChange={(open) => !open && setActiveChatFriend(null)}>
        <DialogContent className="sm:max-w-[425px] p-0 gap-0 max-h-[80vh] flex flex-col">
          <DialogHeader className="px-4 py-2 border-b bg-emerald-600 dark:bg-emerald-800 text-white flex flex-row items-center gap-3">
            <DialogClose className="absolute right-4 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {activeChatFriend && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeChatFriend.avatar || "/placeholder.svg"} alt={activeChatFriend.name} />
                  <AvatarFallback>{activeChatFriend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-white">{activeChatFriend.name}</DialogTitle>
                  <p className="text-xs text-emerald-100">{getStatusText(activeChatFriend)}</p>
                </div>
              </>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 bg-slate-100 dark:bg-slate-900 bg-[url('/whatsapp-bg.png')] bg-opacity-10 dark:bg-opacity-5">
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender === "user"
                        ? "bg-emerald-100 dark:bg-emerald-900/70 rounded-tr-none text-emerald-900 dark:text-emerald-50"
                        : "bg-white dark:bg-slate-800 rounded-tl-none text-slate-900 dark:text-slate-50"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-[10px] text-right mt-1 text-muted-foreground">
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 border-t flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Smile className="h-5 w-5 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5 text-slate-500" />
            </Button>
            <Input
              placeholder="Type a message"
              className="flex-1 bg-white dark:bg-slate-800 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={sendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { ToastAction } from "@/components/ui/toast"
