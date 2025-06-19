import { motion } from 'framer-motion'
import { Plus, MessageSquare, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const ChatSidebar = ({ isOpen, onClose, onNewChat, chatSessions = [], onLoadChat, currentChatId }) => (
  <Sheet open={isOpen} onOpenChange={onClose}>
    <SheetContent side="left" className="w-80 p-0">
      <div className="flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg">Talk to a Folder</SheetTitle>
              <SheetDescription className="text-sm">
                AI-powered document conversations
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="px-6 pb-4">
          <Button 
            onClick={onNewChat} 
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <Separator />
        
        <div className="flex-1 overflow-auto p-6 pt-4">
          <div className="space-y-6">
            {/* Chat History */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recent Chats
              </h3>
              
              {chatSessions.length === 0 ? (
                <Card className="p-4 text-center">
                  <div className="text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                    <p className="text-xs mt-1">
                      Start a conversation to see it here
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-2">
                  {chatSessions.slice(0, 10).map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`p-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                          session.id === currentChatId ? 'ring-2 ring-primary/20 bg-accent/30' : ''
                        }`}
                        onClick={() => onLoadChat(session.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                            <MessageSquare className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {session.messageCount} messages
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-2 w-2" />
                                {new Date(session.lastUpdated).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
)

export default ChatSidebar