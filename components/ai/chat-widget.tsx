'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Loader2,
  MessageSquare,
  Bot,
  User,
  Trash2,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'default' | 'minimal' | 'gradient'
  placeholder?: string
  welcomeMessage?: string
  agentName?: string
}

// ==================== MAIN COMPONENT ====================

export default function AIChatWidget({
  className,
  position = 'bottom-right',
  theme = 'default',
  placeholder = 'Ask me anything about studying...',
  welcomeMessage = "Hi! 👋 I'm StudyBuddy, your AI study assistant. How can I help you today?",
  agentName = 'StudyBuddy',
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      textareaRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: messages.length > 1 ? messages[0].id : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }])
  }

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
  }

  const themeClasses = {
    default: 'bg-background border shadow-xl',
    minimal: 'bg-background/95 backdrop-blur border shadow-lg',
    gradient: 'bg-gradient-to-br from-background to-muted border shadow-xl',
  }

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed z-50 p-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
              'hover:shadow-xl transition-shadow',
              positionClasses[position],
              className
            )}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 w-[380px] rounded-2xl overflow-hidden',
              themeClasses[theme],
              positionClasses[position],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{agentName}</h3>
                  <p className="text-xs text-white/80">AI Study Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                >
                  <ScrollArea className="h-[340px] p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'flex gap-3',
                            message.role === 'user' ? 'flex-row-reverse' : ''
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            message.role === 'user' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-muted'
                          )}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className={cn(
                            'group relative max-w-[75%] rounded-2xl px-4 py-2.5',
                            message.role === 'user'
                              ? 'bg-orange-500 text-white rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <span className={cn(
                              'text-[10px] mt-1 block',
                              message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'
                            )}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {/* Copy button */}
                            {message.role === 'assistant' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(message.content, message.id)}
                                className="absolute -right-10 top-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedId === message.id ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Loading indicator */}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t bg-background/50">
                    <div className="flex gap-2">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
                        rows={1}
                      />
                      <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="h-11 w-11 rounded-xl bg-orange-500 hover:bg-orange-600"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Powered by AI • Press Enter to send
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
