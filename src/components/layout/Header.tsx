'use client';

import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

interface HeaderProps {
  variant?: 'student' | 'organization';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'student' }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentLinks = [
    { href: '/cases', label: '🔍 Problem Bank' },
    { href: '/internships', label: '💼 Internships' },
    { href: '/programs', label: '🎓 Summer Programs' },
    { href: '/projects', label: '📂 My Projects' },
  ];

  const orgLinks = [
    { href: '/dashboard', label: '📊 Dashboard' },
    { href: '/dashboard/cases', label: '📝 Cases' },
    { href: '/dashboard/opportunities', label: '📌 Opportunities' },
    { href: '/dashboard/submissions', label: '👀 Student Work' },
  ];

  const links = variant === 'student' ? studentLinks : orgLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background-primary/90 backdrop-blur-md border-b border-border h-[56px]">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={variant === 'student' ? '/cases' : '/dashboard'}
          className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          📦 CaseVault
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
              Sign Out
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background-primary">
          <nav className="flex flex-col p-4 space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border mt-2">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-text-secondary hover:text-primary">
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
