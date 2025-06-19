// Google OAuth configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: '148917630601-l3hlmck6hdfu1okai7f94tgbq7kmiiar.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
}

// Wait for Google APIs to load
const waitForGoogleAPIs = () => {
  return new Promise((resolve, reject) => {
    const checkAPIs = () => {
      if (window.google && window.google.accounts) {
        resolve()
      } else {
        setTimeout(checkAPIs, 100)
      }
    }
    checkAPIs()
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Google Identity Services failed to load')), 10000)
  })
}

// Initialize Google Identity Services
export const initializeGoogleAPI = () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🔧 Waiting for Google Identity Services to load...')
      await waitForGoogleAPIs()
      console.log('✅ Google Identity Services loaded')
      
      if (!window.google || !window.google.accounts) {
        throw new Error('Google Identity Services not available')
      }
      
      console.log('✅ Google Identity Services ready')
      resolve(window.google)
    } catch (error) {
      console.error('❌ Google Identity Services initialization failed:', error)
      reject(error)
    }
  })
}

// Sign in with Google using new Identity Services
export const signInWithGoogle = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🔧 Initializing Google Identity Services...')
      const google = await initializeGoogleAPI()
      console.log('✅ Google Identity Services initialized')
      
      console.log('🔧 Starting OAuth2 flow...')
      
      // Initialize OAuth2 client
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: async (response) => {
          try {
            console.log('✅ OAuth2 response received:', {
              hasAccessToken: !!response.access_token,
              tokenLength: response.access_token?.length,
              scope: response.scope
            })
            
            if (!response.access_token) {
              reject(new Error('No access token received'))
              return
            }
            
            // Get user profile using the access token
            console.log('🔧 Fetching user profile...')
            const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
            
            if (!profileResponse.ok) {
              throw new Error(`Failed to fetch user profile: ${profileResponse.status}`)
            }
            
            const profile = await profileResponse.json()
            console.log('✅ User profile fetched:', {
              id: profile.id,
              name: profile.name,
              email: profile.email
            })
            
            resolve({
              accessToken: response.access_token,
              idToken: null, // OAuth2 flow doesn't provide id_token
              profile: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                imageUrl: profile.picture
              }
            })
          } catch (error) {
            console.error('❌ Error processing OAuth2 response:', error)
            reject(error)
          }
        },
        error_callback: (error) => {
          console.error('❌ OAuth2 error:', error)
          reject(new Error(`OAuth2 error: ${error.type} - ${error.message}`))
        }
      })
      
      console.log('🔧 Requesting access token...')
      client.requestAccessToken()
      
    } catch (error) {
      console.error('❌ Google sign-in error:', {
        error: error,
        message: error.message,
        stack: error.stack
      })
      
      // Provide more specific error messages
      if (error.message && error.message.includes('popup')) {
        reject(new Error('Popup was blocked by browser. Please allow popups and try again.'))
      } else if (error.message && error.message.includes('origin')) {
        reject(new Error('Invalid origin. Please check your Google OAuth configuration.'))
      } else {
        reject(error)
      }
    }
  })
}

// Sign out (simplified for OAuth2 flow)
export const signOutFromGoogle = async () => {
  try {
    console.log('🔧 Signing out from Google...')
    // With OAuth2 flow, we just clear local state
    // The user would need to revoke access manually or we'd need to implement token revocation
    console.log('✅ Local sign-out completed')
  } catch (error) {
    console.error('Google sign-out error:', error)
    throw error
  }
}

// Check if user is signed in (simplified - we don't maintain persistent state)
export const isGoogleSignedIn = async () => {
  try {
    // With OAuth2 flow, we don't maintain persistent sign-in state
    // This would need to be managed by the app
    return false
  } catch (error) {
    return false
  }
}

// Get current user (simplified - no persistent state)
export const getCurrentGoogleUser = async () => {
  try {
    // With OAuth2 flow, we don't maintain current user state
    // This would need to be managed by the app
    return null
  } catch (error) {
    return null
  }
}