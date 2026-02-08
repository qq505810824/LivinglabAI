'use client'

import { useAuth } from '@/hooks/useAuth'
import { Bell, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const router = useRouter()
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
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
        { href: '/privacy', label: 'Privacy' },
        { href: '/terms', label: 'Terms' },
    ]

    const isLinkActive = (href: string) => {
        if (href === '/') {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg text-xl">
                        AI
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">TalentSync AI</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 text-gray-500 gap-2 w-64">
                        <Search size={18} />
                        <span className="text-sm">Search employees...</span>
                    </div>
                    <button className="p-3 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">HR Manager</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-900 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                            HR
                        </div>
                    </div>
                </div>
            </div>
        </header>

    )
}
