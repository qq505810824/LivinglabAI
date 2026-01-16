import { useState } from 'react'
import { TeaTalk } from '@/hooks/useTeaTalks'
import { ThumbsUp, ThumbsDown, Clock, X } from 'lucide-react'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

interface TeaTalkCardProps {
  talk: TeaTalk
  onLike: (id: string) => void
  onDislike: (id: string) => void
}

export function TeaTalkCard({ talk, onLike, onDislike }: TeaTalkCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const renderTitle = (title: string) => {
    return title.split(/(#[\u4e00-\u9fa5a-zA-Z0-9_]+)/g).map((part, i) => 
      part.startsWith('#') ? (
        <span key={i} className="text-tea-600 font-bold mr-1">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-earth-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Left: User Info */}
        <div className="flex-shrink-0 flex flex-row md:flex-col items-center w-full md:w-24 p-3 md:p-6 border-b md:border-b-0 md:border-r border-earth-50 bg-tea-50/30">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-earth-100 ring-2 ring-white shadow-sm">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={talk.user.avatar} alt={talk.user.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-medium text-tea-900 text-sm ml-3 md:ml-0 md:mt-2 text-left md:text-center break-words w-full leading-tight">
            {talk.user.name}
          </h3>
        </div>

        {/* Middle: Content */}
        <div className="flex-grow p-4 md:p-5 flex flex-col min-w-0">
          <div>
            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 mb-1 leading-snug">
              {renderTitle(talk.title)}
            </h2>

            {/* Date */}
            <div className="flex items-center text-xs text-earth-400 mb-3">
              <Clock className="w-3 h-3 mr-1" />
              {moment(talk.created_at).format('YYYY-MM-DD HH:mm')}
            </div>

            {/* Description */}
            <p className="text-earth-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {talk.content}
            </p>

            {/* Mobile Image */}
            {talk.image_url && (
              <div 
                className="block md:hidden w-full h-48 rounded-lg overflow-hidden mb-4 cursor-zoom-in relative group"
                onClick={() => setIsModalOpen(true)}
              >
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">查看大图</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={talk.image_url} 
                  alt={talk.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-auto flex items-center gap-6 pt-2 border-t border-dashed border-earth-100">
            <button 
              onClick={() => onLike(talk.id)}
              className="flex items-center gap-1.5 text-earth-500 hover:text-tea-500 transition-colors group"
            >
              <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{talk.likes}</span>
            </button>
            
            <button 
              onClick={() => onDislike(talk.id)}
              className="flex items-center gap-1.5 text-earth-500 hover:text-red-500 transition-colors group"
            >
              <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{talk.dislikes}</span>
            </button>
          </div>
        </div>

        {/* Desktop Image */}
        {talk.image_url && (
          <div 
            className="hidden md:block flex-shrink-0 w-48 relative cursor-zoom-in group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">查看大图</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={talk.image_url} 
              alt={talk.title} 
              className="w-full h-[200px] object-cover"
            />
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(false)
              }}
            >
              <X className="w-8 h-8" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={talk.image_url} 
              alt={talk.title} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
