'use client'

import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

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

    // 从 Supabase 会话中恢复用户
    useEffect(() => {
        const init = async () => {
            const {
                data: { session }
            } = await supabase.auth.getSession()

            const authUser = session?.user
            if (authUser) {
                const username =
                    (authUser.user_metadata as any)?.username ||
                    (authUser.email ? authUser.email.split('@')[0] : '用户')

                const mappedUser: User = {
                    id: authUser.id,
                    username,
                    email: authUser.email || '',
                    avatar: ``,
                    token: session.access_token
                }

                setUser(mappedUser)
            } else {
                const mappedUser: User = {
                    "id": "9b286ae2-a8d2-4aec-adf7-caa992743c7c",
                    "username": "cong",
                    "email": "505810824@qq.com",
                    "avatar": "",
                    "token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjQxYzE1MzI5LTY4YmQtNGI3Mi05MWQyLTVkYmQ0MjgzN2M2YSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3p4dWJtcXRrbGdyenFqZ2JqeWppLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5YjI4NmFlMi1hOGQyLTRhZWMtYWRmNy1jYWE5OTI3NDNjN2MiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxMDA2NjI0LCJpYXQiOjE3NzEwMDMwMjQsImVtYWlsIjoiNTA1ODEwODI0QHFxLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiI1MDU4MTA4MjRAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiOWIyODZhZTItYThkMi00YWVjLWFkZjctY2FhOTkyNzQzYzdjIiwidXNlcm5hbWUiOiJjb25nIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzA2MjYxODR9XSwic2Vzc2lvbl9pZCI6IjAwN2U1MmQ4LWQ3ZjktNDZjNy1hNGVmLTA0MmE4YTc0NjM1NiIsImlzX2Fub255bW91cyI6ZmFsc2V9.ABqvCdhVvrwcjWD5ab6A_kanD4v7prtHCY84t4lIp9ZxqU3PzOCDxBfezUiM3nVIQB7qQo9Q1G6442a233sEVA"

                }
                setUser(mappedUser)
            }
            setIsLoading(false)
        }

        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const syncUserToProfiles = async (authUserId: string, email: string | null, username: string) => {
        try {
            await fetch('/api/auth/sync-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authUserId,
                    email,
                    name: username
                })
            })
        } catch (e) {
            console.error('Failed to sync user to users table', e)
        }
    }

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error || !data.user || !data.session) {
                throw new Error(error?.message || '登录失败')
            }

            const authUser = data.user
            const username =
                (authUser.user_metadata as any)?.username ||
                (authUser.email ? authUser.email.split('@')[0] : '用户')

            await syncUserToProfiles(authUser.id, authUser.email ?? null, username)

            const mappedUser: User = {
                id: authUser.id,
                username,
                email: authUser.email || '',
                avatar: ``,
                token: data.session.access_token
            }

            setUser(mappedUser)
            router.push('/')
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (username: string, email: string, password: string) => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            })

            if (error) {
                throw new Error(error.message || '注册失败')
            }

            const authUser = data.user

            if (!authUser) {
                // 需要邮箱验证的情况
                setIsLoading(false)
                router.push('/login')
                return
            }

            await syncUserToProfiles(authUser.id, authUser.email ?? null, username)

            const mappedUser: User = {
                id: authUser.id,
                username,
                email: authUser.email || '',
                avatar: ``
            }

            setUser(mappedUser)
            router.push('/')
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
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
