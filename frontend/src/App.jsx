import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:8000'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [folderUrl, setFolderUrl] = useState('')
  const [jobId, setJobId] = useState(null)
  const [indexStatus, setIndexStatus] = useState('')
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Check if we have a session on load
  useEffect(() => {
    const savedSession = localStorage.getItem('sessionId')
    if (savedSession) {
      setSessionId(savedSession)
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      // For MVP, simulate the OAuth flow with a mock code
      const mockAuthCode = 'mock_auth_code_' + Math.random().toString(36).substr(2, 9)
      
      const response = await axios.post(`${API_BASE}/auth/google`, {
        code: mockAuthCode
      })
      
      setSessionId(response.data.session_id)
      localStorage.setItem('sessionId', response.data.session_id)
      
      // Add welcome message
      setMessages([{
        type: 'system',
        content: 'Successfully authenticated! You can now paste a Google Drive folder URL.'
      }])
    } catch (error) {
      console.error('Auth error:', error)
      alert('Authentication failed. Please try again.')
    }
  }

  const handleIndexFolder = async () => {
    if (!folderUrl.trim()) {
      alert('Please enter a folder URL')
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE}/index`, {
        session_id: sessionId,
        folder_url: folderUrl
      })
      
      setJobId(response.data.job_id)
      setIndexStatus(response.data.status)
      
      setMessages(prev => [...prev, {
        type: 'system',
        content: `Folder indexed successfully! Found files in your folder. You can now start asking questions.`
      }])
      
    } catch (error) {
      console.error('Index error:', error)
      alert('Failed to index folder. Please check the URL and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return
    
    const userMessage = currentMessage
    setCurrentMessage('')
    
    // Add user message to chat
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
      
      // Add bot response to chat
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.answer,
        citations: response.data.citations
      }])
      
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.'
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

  if (!sessionId) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Talk to a Folder</h1>
          <p>Connect to Google Drive and chat with your folders</p>
          <button onClick={handleGoogleLogin} className="login-btn">
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Talk to a Folder</h1>
        <button onClick={() => {
          setSessionId(null)
          localStorage.removeItem('sessionId')
          setMessages([])
        }} className="logout-btn">
          Logout
        </button>
      </div>

      {!jobId && (
        <div className="folder-input">
          <h3>Paste Google Drive Folder URL</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="https://drive.google.com/drive/folders/..."
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
              className="folder-url-input"
            />
            <button 
              onClick={handleIndexFolder} 
              disabled={isLoading}
              className="index-btn"
            >
              {isLoading ? 'Processing...' : 'Index Folder'}
            </button>
          </div>
        </div>
      )}

      {jobId && (
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                  {message.citations && message.citations.length > 0 && (
                    <div className="citations">
                      <small>Sources: {message.citations.map(c => c.file_name).join(', ')}</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content typing">Thinking...</div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your folder..."
              className="message-input"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !currentMessage.trim()}
              className="send-btn"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
