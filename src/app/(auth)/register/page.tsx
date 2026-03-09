'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
    const { register } = useAuth()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await register(username, email, password)
        } catch (err) {
            setError(err instanceof Error ? err.message : '注册失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card title="创建账号" className="w-full     shadow-xl shadow-sky-200/20">
                <p className="text-sm text-earth-500 mb-6 -mt-2">注册LivinglabAI账号，开启您的职场之旅</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="用户名"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="请输入用户名"
                    />
                    <Input
                        label="邮箱"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="请输入邮箱"
                    />
                    <Input
                        label="密码"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="请输入密码"
                    />
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <Button
                        type="submit"
                        className="w-full bg-sky-500 hover:bg-sky-700"
                        disabled={loading}
                    >
                        {loading ? '注册中...' : '注册'}
                    </Button>
                    <div className="text-center text-sm text-earth-500">
                        已有账号？{' '}
                        <Link href="/login" className="text-tea-600 font-medium hover:text-tea-700 hover:underline transition-colors">
                            立即登录
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    )
}
