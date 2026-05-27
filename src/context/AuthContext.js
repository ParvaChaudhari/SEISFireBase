"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import firebase_app from '@/src/firebase/config'

export const AuthContext = createContext({})

export const useAuthContext = () => useContext(AuthContext)

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebase_app) {
      // Firebase not initialized on server; nothing to do.
      setLoading(false)
      return
    }

    const auth = getAuth(firebase_app)

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult()
          setIsAdmin(!!idTokenResult.claims.admin || currentUser.email === 'admin@demo.com')
        } catch (e) {
          setIsAdmin(currentUser.email === 'admin@demo.com')
        }
        setUser(currentUser)
      } else {
        setIsAdmin(false)
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #E2E2E4 0%, #F5F5F7 100%)',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px'
        }}>
          <div style={{
            background: '#004e9f',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex'
          }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1D1D1F', letterSpacing: '-0.01em' }}>Academic Portal</span>
        </div>
        <div className="portal-spinner"></div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#86868B' }}>Loading your workspace...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

