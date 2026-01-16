'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import usersData from '@/datas/users.json'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('tea_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user from localStorage', e)
        localStorage.removeItem('tea_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = usersData.find(u => u.email === email && u.password === password)

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser
      const userToSave = { ...userWithoutPassword, token: 'mock-token-' + Date.now() }
      setUser(userToSave)
      localStorage.setItem('tea_user', JSON.stringify(userToSave))
      router.push('/')
    } else {
      setIsLoading(false)
      throw new Error('Invalid email or password')
    }
    setIsLoading(false)
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const existingUser = usersData.find(u => u.email === email)
    if (existingUser) {
      setIsLoading(false)
      throw new Error('Email already exists')
    }

    // In a real app, we would add to the database.
    // Here we just simulate a successful registration and login.
    // Since we can't write to the JSON file in the browser/client easily (and shouldn't),
    // we will just log them in as a new user.
    // Note: This new user won't persist in users.json, so refreshing and logging in again won't work 
    // unless we persist to localStorage (which we do for the session).
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      token: 'mock-token-' + Date.now()
    }

    setUser(newUser)
    localStorage.setItem('tea_user', JSON.stringify(newUser))
    router.push('/')
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tea_user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
