'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, Coffee, X, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/teas', label: '茶叶百科' },
    { href: '/culture', label: '茶文化' },
    { href: '/brewing', label: '冲泡指南' },
    { href: '/tea-talk', label: '喝茶吧' },
    { href: '/about', label: '关于我们' },
  ]

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-tea-100 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-tea-700 hover:text-tea-600 transition-colors">
            <img src="/icon.png" className="h-7 w-7" />
            <span className="tracking-wide">茶韵</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-earth-600">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-200",
                  "hover:bg-tea-50 hover:text-tea-700",
                  isActive 
                    ? "bg-tea-100 text-tea-800 font-semibold shadow-sm" 
                    : "text-earth-600"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-tea-50 py-1.5 px-3 rounded-full transition-colors outline-none"
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full border border-tea-200 object-cover" 
                />
                <span className="text-sm font-medium text-tea-800 max-w-[100px] truncate">{user.username}</span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-tea-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-tea-50">
                    <p className="text-sm font-medium text-tea-900 truncate">{user.username}</p>
                    <p className="text-xs text-earth-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-earth-600 hover:bg-tea-50 hover:text-tea-700 transition-colors text-left"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      个人设置
                    </button>
                    
                    <button 
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      onClick={() => {
                        logout()
                        setIsUserMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hidden md:inline-flex bg-tea-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-tea-600 transition-colors shadow-sm hover:shadow"
            >
              登录
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden rounded-full p-2 text-earth-600 hover:bg-tea-50 hover:text-tea-600 transition-colors" 
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div 
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bg-white border-b border-tea-100 shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors font-medium",
                  isActive
                    ? "bg-tea-100 text-tea-800 font-semibold"
                    : "text-earth-700 hover:bg-tea-50 hover:text-tea-700"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="pt-4 mt-2 border-t border-earth-100">
            {!user && (
              <Link 
                href="/login" 
                className="px-4 py-3 text-center text-tea-600 font-medium bg-tea-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                登录 / 注册
              </Link>
            )}
            {user && (
              <div className="flex items-center justify-between px-4 py-3 bg-tea-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-8 h-8 rounded-full border border-tea-200 object-cover" 
                  />
                  <span className="text-sm font-medium text-tea-800">{user.username}</span>
                </div>
                <button 
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }} 
                  className="text-sm text-red-600 font-medium"
                >
                  退出
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
