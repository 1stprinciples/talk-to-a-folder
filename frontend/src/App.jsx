import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Folder, 
  User, 
  Bot, 
  Plus, 
  Menu,
  X,
  FileText,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

// Typing indicator component
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center space-x-2 text-gray-500"
  >
    <Bot className="w-5 h-5" />
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </motion.div>
)

// Message component with animations
const Message = ({ message, index }) => {
  const isUser = message.type === 'user'
  const isSystem = message.type === 'system'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start space-x-3 p-4 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      {!isSystem && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-green-100 text-green-600'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      )}
      
      <div className={`max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.1 }}
          className={`inline-block p-4 rounded-2xl ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : isSystem
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.citations && message.citations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 pt-3 border-t border-gray-200 space-y-1"
            >
              <p className="text-sm text-gray-600 font-medium">Sources:</p>
              {message.citations.map((citation, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <FileText className="w-3 h-3" />
                  <span>{citation.file_name}</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// Sidebar component
const Sidebar = ({ isOpen, onClose, onNewChat, folders = [] }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 bg-gray-900 text-white z-50 flex flex-col"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Talk to a Folder</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </motion.button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Folders</h3>
            <div className="space-y-2">
              {folders.map((folder, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm truncate">{folder.name || 'Untitled Folder'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{folder.fileCount} files</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [folderUrl, setFolderUrl] = useState('')
  const [jobId, setJobId] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [folders, setFolders] = useState([])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const savedSession = localStorage.getItem('sessionId')
    if (savedSession) {
      setSessionId(savedSession)
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const mockAuthCode = 'mock_auth_code_' + Math.random().toString(36).substr(2, 9)
      
      const response = await axios.post(`${API_BASE}/auth/google`, {
        code: mockAuthCode
      })
      
      setSessionId(response.data.session_id)
      localStorage.setItem('sessionId', response.data.session_id)
      
      setMessages([{
        type: 'system',
        content: 'Welcome! I\'m your AI assistant. Paste a Google Drive folder URL to get started, and I\'ll help you explore and understand your documents.'
      }])
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const handleIndexFolder = async () => {
    if (!folderUrl.trim()) return

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE}/index`, {
        session_id: sessionId,
        folder_url: folderUrl
      })
      
      setJobId(response.data.job_id)
      
      // Add to folders list
      const newFolder = {
        name: folderUrl.split('/').pop() || 'New Folder',
        fileCount: 3,
        id: response.data.job_id
      }
      setFolders(prev => [newFolder, ...prev])
      
      setMessages(prev => [...prev, {
        type: 'system',
        content: '✨ Folder indexed successfully! I\'ve processed your documents and I\'m ready to answer questions. Try asking me about the content, technologies, or any specific topics you\'re curious about!'
      }])
      
      setFolderUrl('')
      
    } catch (error) {
      console.error('Index error:', error)
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Sorry, I couldn\'t index that folder. Please check the URL and try again.'
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
        session_id: sessionId,
        message: userMessage
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

  const handleNewChat = () => {
    setMessages([])
    setJobId(null)
    setFolderUrl('')
    setSidebarOpen(false)
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
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
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Talk to a Folder
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-8 text-lg"
          >
            Connect your Google Drive and have intelligent conversations with your documents
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continue with Google
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        folders={folders}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
          </div>
          
          {!jobId && (
            <div className="flex items-center space-x-3 max-w-md flex-1 mx-8">
              <input
                type="text"
                placeholder="Paste Google Drive folder URL..."
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleIndexFolder()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleIndexFolder}
                disabled={isLoading || !folderUrl.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Index
              </motion.button>
            </div>
          )}
          
          <button
            onClick={() => {
              setSessionId(null)
              localStorage.removeItem('sessionId')
              setMessages([])
            }}
            className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <Message key={index} message={message} index={index} />
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
            className="border-t border-gray-200 bg-white p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your documents..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-32"
                    rows="1"
                    disabled={isLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
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
