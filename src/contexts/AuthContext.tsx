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
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        username
                    )}`,
                    token: session.access_token
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
