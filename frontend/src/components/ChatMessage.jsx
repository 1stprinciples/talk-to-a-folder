import { motion } from 'framer-motion'
import { Bot, User, FileText, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const ChatMessage = ({ message, index }) => {
  const isUser = message.type === 'user'
  const isSystem = message.type === 'system'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex items-start gap-4 max-w-4xl mx-auto px-4 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {!isSystem && (
        <Avatar className="shrink-0 border-2 border-background shadow-sm">
          <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 space-y-2 ${isUser ? 'text-right' : ''}`}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
        >
          <Card className={`inline-block max-w-[85%] ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : isSystem
              ? 'bg-muted border-muted-foreground/20'
              : 'bg-card'
          }`}>
            <div className="p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              
              {message.citations && message.citations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-4"
                >
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.citations.map((citation, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {citation.file_name}
                          <ExternalLink className="h-2 w-2" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ChatMessage