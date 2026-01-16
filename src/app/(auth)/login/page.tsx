'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card title="欢迎回来" className="w-full border-tea-200 shadow-xl shadow-tea-200/20">
        <p className="text-sm text-earth-500 mb-6 -mt-2">请登录您的账号以继续</p>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full bg-tea-600 hover:bg-tea-700"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
          <div className="text-center text-sm text-earth-500">
            还没有账号？{' '}
            <Link href="/register" className="text-tea-600 font-medium hover:text-tea-700 hover:underline transition-colors">
              立即注册
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
