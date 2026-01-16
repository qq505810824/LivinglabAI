import { useState } from 'react'
import { Send, Image as ImageIcon, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

interface TeaTalkFormProps {
  onSubmit: (title: string, content: string, imageUrl: string) => void
}

export function TeaTalkForm({ onSubmit }: TeaTalkFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    
    onSubmit(title, content, imageUrl)
    setTitle('')
    setContent('')
    setImageUrl('')
    setShowImageInput(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-tea-100 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-tea-900 mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-tea-500 rounded-full"></span>
        分享你的茶语
      </h3>
      
      {user ? (
        <div className="flex items-center gap-3 mb-6 p-3 bg-tea-50/50 rounded-lg">
          <img 
            src={user.avatar} 
            alt={user.username} 
            className="w-10 h-10 rounded-full border border-tea-200 object-cover" 
          />
          <div>
            <div className="font-medium text-tea-900">{user.username}</div>
            <div className="text-xs text-tea-600">正在分享...</div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-tea-50 rounded-lg border border-tea-100 flex items-center justify-between">
          <span className="text-tea-800">登录后即可分享你的茶语</span>
          <Link href="/login" className="px-4 py-2 bg-tea-500 text-white rounded-lg text-sm font-medium hover:bg-tea-600 transition-colors">
            去登录
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-4 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题 (可以使用 #标签)"
            className="w-full px-4 py-3 rounded-lg border border-earth-200 focus:border-tea-500 focus:ring-2 focus:ring-tea-200 outline-none transition-all text-lg font-medium"
            required
          />
        </div>
        
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你对茶的感悟..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-earth-200 focus:border-tea-500 focus:ring-2 focus:ring-tea-200 outline-none transition-all resize-none"
            required
          />
        </div>

        {showImageInput && (
          <div className="relative">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="输入图片链接 (https://...)"
              className="w-full px-4 py-3 rounded-lg border border-earth-200 focus:border-tea-500 focus:ring-2 focus:ring-tea-200 outline-none transition-all bg-earth-50"
            />
            <button 
              type="button"
              onClick={() => {
                setShowImageInput(false)
                setImageUrl('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showImageInput ? 'bg-tea-100 text-tea-700' : 'text-earth-500 hover:bg-earth-50'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>添加图片</span>
          </button>

          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="flex items-center gap-2 bg-tea-600 text-white px-8 py-3 rounded-full font-medium hover:bg-tea-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Send className="w-5 h-5" />
            发布
          </button>
        </div>
      </form>
    </div>
  )
}
