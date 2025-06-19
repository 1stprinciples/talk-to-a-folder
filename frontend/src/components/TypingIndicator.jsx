import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="flex items-start gap-4 max-w-4xl mx-auto px-4"
  >
    <Avatar className="shrink-0 border-2 border-background shadow-sm">
      <AvatarFallback className="bg-muted">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    
    <Card className="bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-sm">Thinking</span>
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </Card>
  </motion.div>
)

export default TypingIndicator