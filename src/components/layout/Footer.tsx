import Link from 'next/link'
import { Coffee, Mail, Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-tea-100 bg-tea-50/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-row items-center gap-2 text-xl font-bold text-tea-700 hover:text-tea-600 transition-colors">
              <Coffee className="h-6 w-6" /><span className="tracking-wide">茶韵</span>
            </Link>
            <p className="text-sm text-earth-600 leading-relaxed max-w-xs">
              致力于传播中国茶文化，让更多人了解茶、喜爱茶、品味茶。从一片树叶到一杯香茗，我们与您同行。
            </p>
          </div>
          
          {/* Links Column 1 */}
          <div>
            <h3 className="font-bold text-tea-800 mb-4 md:mb-6">探索</h3>
            <ul className="space-y-3 text-sm text-earth-600">
              <li><FooterLink href="/teas">茶叶百科</FooterLink></li>
              <li><FooterLink href="/culture">茶文化</FooterLink></li>
              <li><FooterLink href="/brewing">冲泡指南</FooterLink></li>
              <li><FooterLink href="/shop">茶具商城</FooterLink></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-bold text-tea-800 mb-4 md:mb-6">关于</h3>
            <ul className="space-y-3 text-sm text-earth-600">
              <li><FooterLink href="/about">关于我们</FooterLink></li>
              <li><FooterLink href="/contact">联系方式</FooterLink></li>
              <li><FooterLink href="/privacy">隐私政策</FooterLink></li>
              <li><FooterLink href="/terms">服务条款</FooterLink></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-bold text-tea-800 mb-4 md:mb-6">订阅我们</h3>
            <p className="text-sm text-earth-600 mb-4 leading-relaxed">
              订阅我们的周刊，获取最新的茶知识与活动资讯。
            </p>
            <form className="flex gap-2" >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
                <input 
                  type="email" 
                  placeholder="您的邮箱" 
                  className="w-full rounded-full border border-tea-200 bg-white pl-10 pr-4 py-2.5 text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-all"
                />
              </div>
              <button 
                type="submit"
                className="bg-tea-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tea-600 transition-colors shadow-sm hover:shadow active:scale-95 transform"
              >
                订阅
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-tea-200/60 text-center text-sm text-earth-500">
          <p>© {new Date().getFullYear()} 茶韵 Tea Culture Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-tea-600 hover:translate-x-1 transition-all inline-block">
      {children}
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      className="text-earth-400 hover:text-tea-600 transition-colors p-1 hover:bg-tea-100 rounded-full"
      aria-label={label}
    >
      {icon}
    </a>
  )
}
