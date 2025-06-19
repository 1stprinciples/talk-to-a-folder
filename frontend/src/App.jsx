import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Menu,
  Sparkles,
  LogOut
} from 'lucide-react'
import axios from 'axios'
import { signInWithGoogle, signOutFromGoogle, getCurrentGoogleUser, initializeGoogleAPI } from './config/google'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// Custom components
import ChatMessage from '@/components/ChatMessage'
import TypingIndicator from '@/components/TypingIndicator'
import ChatSidebar from '@/components/ChatSidebar'

const API_BASE = 'http://localhost:8000'

function App() {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [folderUrl, setFolderUrl] = useState('')
  const [jobId, setJobId] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [folders, setFolders] = useState([])
  const [chatSessions, setChatSessions] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Save current chat session
  const saveCurrentChat = () => {
    if (currentChatId && messages.length > 0) {
      setChatSessions(prev => {
        const existingIndex = prev.findIndex(session => session.id === currentChatId)
        const updatedSession = {
          id: currentChatId,
          title: generateChatTitle(messages),
          messages: [...messages],
          jobId: jobId,
          folderUrl: folderUrl || prev.find(s => s.id === currentChatId)?.folderUrl,
          lastUpdated: new Date().toISOString(),
          messageCount: messages.filter(m => m.type !== 'system').length
        }
        
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = updatedSession
          return updated
        } else {
          // Add new session and limit to 50 recent chats
          return [updatedSession, ...prev].slice(0, 50)
        }
      })
    }
  }

  // Generate chat title from messages
  const generateChatTitle = (msgs) => {
    const userMessages = msgs.filter(m => m.type === 'user')
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content
      return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage
    }
    return 'New Chat'
  }

  // Load a chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      // Save current chat before switching
      saveCurrentChat()
      
      setCurrentChatId(sessionId)
      setMessages(session.messages)
      setJobId(session.jobId)
      setFolderUrl(session.folderUrl || '')
      setSidebarOpen(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-save chat when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentChat()
    }, 1000) // Debounce saving by 1 second
    
    return () => clearTimeout(timer)
  }, [messages, currentChatId, jobId])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initializeGoogleAPI()
        const currentUser = await getCurrentGoogleUser()
        if (currentUser) {
          setUser(currentUser.profile)
          setAccessToken(currentUser.accessToken)
          
          // Create initial chat session
          const initialChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          setCurrentChatId(initialChatId)
          setMessages([{
            type: 'system',
            content: `Welcome back, ${currentUser.profile.name}! I'm your AI assistant. Paste a Google Drive folder URL to get started.`
          }])
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      console.log('🔐 Starting Google login process...')
      setIsLoading(true)
      
      console.log('🔑 Calling signInWithGoogle...')
      const authResult = await signInWithGoogle()
      console.log('✅ Google sign-in successful:', {
        hasAccessToken: !!authResult.accessToken,
        hasIdToken: !!authResult.idToken,
        profileName: authResult.profile?.name,
        profileEmail: authResult.profile?.email
      })
      
      // Send real access token to backend
      console.log('📤 Sending auth data to backend...')
      const backendPayload = {
        access_token: authResult.accessToken,
        id_token: authResult.idToken
      }
      console.log('📤 Backend payload:', {
        hasAccessToken: !!backendPayload.access_token,
        hasIdToken: !!backendPayload.id_token,
        accessTokenLength: backendPayload.access_token?.length,
        apiBase: API_BASE
      })
      
      const response = await axios.post(`${API_BASE}/auth/google`, backendPayload)
      console.log('✅ Backend auth response:', response.data)
      
      setUser(authResult.profile)
      setAccessToken(authResult.accessToken)
      
      // Create initial chat session
      const initialChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCurrentChatId(initialChatId)
      setMessages([{
        type: 'system',
        content: `Welcome, ${authResult.profile.name}! I'm your AI assistant. Paste a Google Drive folder URL to get started, and I'll help you explore and understand your documents.`
      }])
      
      console.log('🎉 Login process completed successfully!')
    } catch (error) {
      console.error('❌ Auth error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      })
      alert(`Authentication failed: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutFromGoogle()
      setUser(null)
      setAccessToken(null)
      setMessages([])
      setJobId(null)
      setFolders([])
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleIndexFolder = async () => {
    if (!folderUrl.trim()) return

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE}/index`, {
        access_token: accessToken,
        folder_url: folderUrl
      })
      
      setJobId(response.data.job_id)
      
      // Add to folders list (prevent duplicates)
      const newFolder = {
        name: response.data.folder_name || folderUrl.split('/').pop() || 'New Folder',
        fileCount: response.data.files_count || 0,
        id: response.data.job_id,
        folderUrl: folderUrl
      }
      setFolders(prev => {
        // Remove any existing folder with the same URL or job_id
        const filtered = prev.filter(folder => 
          folder.folderUrl !== folderUrl && folder.id !== response.data.job_id
        )
        // Add new folder and limit to 20 recent folders
        return [newFolder, ...filtered].slice(0, 20)
      })
      
      setMessages(prev => [...prev, {
        type: 'system',
        content: `✨ Folder "${newFolder.name}" indexed successfully! I found ${newFolder.fileCount} files and I'm ready to answer questions about them.`
      }])
      
      setFolderUrl('')
      
    } catch (error) {
      console.error('Index error:', error)
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Sorry, I couldn\'t index that folder. Please make sure the folder is shared publicly or you have access to it.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return
    
    const userMessage = currentMessage
    setCurrentMessage('')
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }])

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE}/chat`, {
        access_token: accessToken,
        message: userMessage,
        job_id: jobId
      })
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.answer,
        citations: response.data.citations
      }])
      
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'I encountered an error processing your message. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // User selects a folder from sidebar list
  const handleSelectFolder = (folder) => {
    // If there's an existing chat associated with this folder's jobId, load it
    const existingSession = chatSessions.find(s => s.jobId === folder.id)

    if (existingSession) {
      loadChatSession(existingSession.id)
    } else {
      // Otherwise start a new chat context linked to this folder
      saveCurrentChat()
      const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCurrentChatId(newChatId)
      setMessages([])
    }

    // Ensure the jobId is set so the chat input is enabled
    setJobId(folder.id)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    // Save current chat before creating new one
    saveCurrentChat()
    
    // Start new chat
    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCurrentChatId(newChatId)
    setMessages([])
    setJobId(null)
    setFolderUrl('')
    setSidebarOpen(false)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-4"
          >
            Talk to a Folder
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-8 text-lg"
          >
            Connect your Google Drive and have intelligent conversations with your documents
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        onLoadChat={loadChatSession}
        currentChatId={currentChatId}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card border-b p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          
          {!jobId && (
            <div className="flex items-center gap-3 max-w-md flex-1 mx-8">
              <Input
                type="text"
                placeholder="Paste Google Drive folder URL..."
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleIndexFolder()}
                className="flex-1"
              />
              <Button
                onClick={handleIndexFolder}
                disabled={isLoading || !folderUrl.trim()}
                className="px-6"
              >
                Index
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.name}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </motion.header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} index={index} />
            ))}
            {isLoading && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {jobId && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t bg-card p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-4">
                <div className="flex-1 relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your documents..."
                    className="w-full px-4 py-3 pr-12 border rounded-2xl focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none max-h-32 bg-background"
                    rows="1"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
