'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, Coffee, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/teas', label: '茶叶百科' },
    { href: '/culture', label: '茶文化' },
    { href: '/brewing', label: '冲泡指南' },
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

          <Link 
            href="/login" 
            className="hidden md:inline-flex bg-tea-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-tea-600 transition-colors shadow-sm hover:shadow"
          >
            登录
          </Link>

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
            <Link 
              href="/login" 
              className="flex items-center justify-center w-full bg-tea-500 text-white px-4 py-3 rounded-full text-sm font-medium hover:bg-tea-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              登录 / 注册
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
