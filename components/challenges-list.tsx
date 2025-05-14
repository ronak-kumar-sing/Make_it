"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Clock, Target, Plus, ArrowRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Challenge {
  id: string
  title: string
  type: "study" | "task" | "streak"
  participants: {
    name: string
    avatar: string
    progress: number
  }[]
  endDate: string
  progress: number
  description?: string
}

interface ChallengesListProps {
  limit?: number
}

export default function ChallengesList({ limit }: ChallengesListProps) {
  const isMobile = useIsMobile()
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Finals Week Study Marathon",
      type: "study",
      participants: [
        { name: "Alex", avatar: "/diverse-group-meeting.png", progress: 85 },
        { name: "Jamie", avatar: "/abstract-geometric-pattern.png", progress: 72 },
        { name: "Taylor", avatar: "/singer-songwriter.png", progress: 65 },
        { name: "Jordan", avatar: "/jordan-landscape.png", progress: 90 },
      ],
      endDate: "2025-05-20",
      progress: 85,
      description:
        "Let's study together for finals week! The goal is to complete at least 20 hours of focused study time.",
    },
    {
      id: "2",
      title: "Physics Project Challenge",
      type: "task",
      participants: [
        { name: "Alex", avatar: "/diverse-group-meeting.png", progress: 60 },
        { name: "Morgan", avatar: "/placeholder.svg?key=c5cyc", progress: 75 },
        { name: "Casey", avatar: "/abstract-casey.png", progress: 45 },
      ],
      endDate: "2025-05-18",
      progress: 60,
      description: "Complete all the exercises in Chapter 7 and prepare for the upcoming physics project.",
    },
    {
      id: "3",
      title: "30-Day Study Streak",
      type: "streak",
      participants: [
        { name: "Alex", avatar: "/diverse-group-meeting.png", progress: 40 },
        { name: "Riley", avatar: "/placeholder.svg?key=j26ys", progress: 37 },
        { name: "Quinn", avatar: "/placeholder.svg?key=kvbve", progress: 40 },
        { name: "Avery", avatar: "/placeholder.svg?key=ggkh9", progress: 33 },
        { name: "Cameron", avatar: "/placeholder.svg?key=234x7", progress: 27 },
      ],
      endDate: "2025-06-10",
      progress: 40,
      description: "Maintain a daily study streak for 30 days. Study at least 30 minutes each day to keep your streak!",
    },
    {
      id: "4",
      title: "Literature Essay Sprint",
      type: "task",
      participants: [
        { name: "Alex", avatar: "/diverse-group-meeting.png", progress: 25 },
        { name: "Jordan", avatar: "/jordan-landscape.png", progress: 40 },
      ],
      endDate: "2025-05-25",
      progress: 25,
      description: "Complete your literature essay before the deadline. Let's motivate each other to finish early!",
    },
  ])

  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    type: "study",
    description: "",
    endDate: "",
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <Clock className="h-3 w-3 md:h-4 md:w-4" />
      case "task":
        return <Target className="h-3 w-3 md:h-4 md:w-4" />
      case "streak":
        return <Trophy className="h-3 w-3 md:h-4 md:w-4" />
      default:
        return <Trophy className="h-3 w-3 md:h-4 md:w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "study":
        return "Study Time"
      case "task":
        return "Task Completion"
      case "streak":
        return "Streak Challenge"
      default:
        return "Challenge"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getDaysRemaining = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(dateString)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const displayedChallenges = limit ? challenges.slice(0, limit) : challenges

  // For mobile, limit the number of participants shown
  const getDisplayedParticipants = (participants: Challenge["participants"]) => {
    if (isMobile && participants.length > 3) {
      return participants.slice(0, 3)
    }
    return participants
  }

  const handleCreateChallenge = () => {
    if (!newChallenge.title || !newChallenge.type || !newChallenge.endDate) return

    const challenge: Challenge = {
      id: Date.now().toString(),
      title: newChallenge.title,
      type: newChallenge.type as "study" | "task" | "streak",
      description: newChallenge.description,
      participants: [{ name: "Alex", avatar: "/diverse-group-meeting.png", progress: 0 }],
      endDate: newChallenge.endDate,
      progress: 0,
    }

    setChallenges([challenge, ...challenges])
    setIsCreateChallengeOpen(false)
    setNewChallenge({
      title: "",
      type: "study",
      description: "",
      endDate: "",
    })
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Study Challenges</h3>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsCreateChallengeOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>New Challenge</span>
        </Button>
      </div>

      {displayedChallenges.map((challenge) => (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-lg p-3 md:p-4 space-y-2 md:space-y-3 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer"
          onClick={() => setSelectedChallenge(challenge)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-sm md:text-base">{challenge.title}</h3>
              <div className="flex flex-wrap items-center text-[10px] md:text-xs text-muted-foreground gap-1 md:gap-2">
                <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs py-0 h-5">
                  {getTypeIcon(challenge.type)}
                  <span>{getTypeLabel(challenge.type)}</span>
                </Badge>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span>{challenge.participants.length}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span>{getDaysRemaining(challenge.endDate)} days left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between items-center text-[10px] md:text-sm">
              <span>Your progress</span>
              <span className="font-medium">{challenge.progress}%</span>
            </div>
            <Progress value={challenge.progress} className="h-1.5 md:h-2 dark:bg-muted/50" />
          </div>

          <div className="space-y-1 md:space-y-2">
            <div className="text-[10px] md:text-sm">Participants</div>
            <div className="flex flex-wrap gap-2">
              {getDisplayedParticipants(challenge.participants).map((participant, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-[10px] md:text-xs text-center">
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-muted-foreground">{participant.progress}%</div>
                  </div>
                </div>
              ))}
              {isMobile && challenge.participants.length > 3 && (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 bg-muted">
                    <AvatarFallback>+{challenge.participants.length - 3}</AvatarFallback>
                  </Avatar>
                  <div className="text-[10px] md:text-xs text-center">
                    <div className="text-muted-foreground">More</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Create Challenge Dialog */}
      <Dialog open={isCreateChallengeOpen} onOpenChange={setIsCreateChallengeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Create a challenge to motivate yourself and your friends to study together.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="challenge-title" className="text-right">
                Title
              </Label>
              <Input
                id="challenge-title"
                placeholder="Enter challenge title"
                className="col-span-3"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="challenge-type" className="text-right">
                Type
              </Label>
              <Select
                value={newChallenge.type}
                onValueChange={(value) => setNewChallenge({ ...newChallenge, type: value })}
              >
                <SelectTrigger className="col-span-3" id="challenge-type">
                  <SelectValue placeholder="Select challenge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study Time</SelectItem>
                  <SelectItem value="task">Task Completion</SelectItem>
                  <SelectItem value="streak">Streak Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="challenge-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="challenge-end-date"
                type="date"
                className="col-span-3"
                value={newChallenge.endDate}
                onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="challenge-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="challenge-description"
                placeholder="Describe your challenge"
                className="col-span-3"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateChallengeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChallenge}>Create Challenge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Challenge Details Dialog */}
      <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedChallenge && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedChallenge.type)}
                  <DialogTitle>{selectedChallenge.title}</DialogTitle>
                </div>
                <DialogDescription>{selectedChallenge.description || "No description provided."}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(selectedChallenge.type)}
                    <span>{getTypeLabel(selectedChallenge.type)}</span>
                  </Badge>

                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Ends {formatDate(selectedChallenge.endDate)}</span>
                  </Badge>

                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{selectedChallenge.participants.length} participants</span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Your progress</span>
                    <span className="font-medium">{selectedChallenge.progress}%</span>
                  </div>
                  <Progress value={selectedChallenge.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Participants</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedChallenge.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.name}</div>
                          <div className="text-xs text-muted-foreground">{participant.progress}% complete</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Tabs defaultValue="progress">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Challenge Progress</CardTitle>
                        <CardDescription>Track your progress and compare with friends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedChallenge.participants.map((participant, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={participant.avatar || "/placeholder.svg"}
                                      alt={participant.name}
                                    />
                                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span>{participant.name}</span>
                                </div>
                                <span className="font-medium">{participant.progress}%</span>
                              </div>
                              <Progress value={participant.progress} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Updates</CardTitle>
                        <CardDescription>Latest activity in this challenge</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarImage src="/jordan-landscape.png" alt="Jordan" />
                              <AvatarFallback>J</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Jordan</span>
                                <span className="text-xs text-muted-foreground">Yesterday at 4:30 PM</span>
                              </div>
                              <p className="text-sm mt-1">
                                Just completed 2 hours of focused study time! Making good progress on the calculus
                                problems.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarImage src="/abstract-geometric-pattern.png" alt="Jamie" />
                              <AvatarFallback>J</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Jamie</span>
                                <span className="text-xs text-muted-foreground">2 days ago</span>
                              </div>
                              <p className="text-sm mt-1">
                                Finished the first section of the project. Let me know if anyone needs help with the
                                formulas!
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Input placeholder="Share an update..." />
                          <Button size="sm">Post</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="chat">
                    <Card>
                      <CardHeader>
                        <CardTitle>Group Chat</CardTitle>
                        <CardDescription>Discuss the challenge with participants</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarImage src="/abstract-geometric-pattern.png" alt="Jamie" />
                              <AvatarFallback>J</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Jamie</span>
                                <span className="text-xs text-muted-foreground">10:30 AM</span>
                              </div>
                              <p className="text-sm mt-1">Hey everyone! How's the challenge going so far?</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 justify-end">
                            <div className="bg-primary text-primary-foreground dark:bg-primary/90 p-3 rounded-lg">
                              <p className="text-sm">I'm making good progress! Already at 40% completion.</p>
                              <div className="text-xs text-right mt-1 opacity-80">10:32 AM</div>
                            </div>
                            <Avatar className="mt-1">
                              <AvatarImage src="/diverse-group-meeting.png" alt="You" />
                              <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarImage src="/jordan-landscape.png" alt="Jordan" />
                              <AvatarFallback>J</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Jordan</span>
                                <span className="text-xs text-muted-foreground">10:35 AM</span>
                              </div>
                              <p className="text-sm mt-1">
                                I'm struggling with the physics problems. Could we have a study session tomorrow?
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Input placeholder="Type a message..." />
                          <Button size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Close
                </Button>
                <Button>Update Progress</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
