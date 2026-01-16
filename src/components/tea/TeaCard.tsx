import Link from 'next/link'
import { Tea } from '@/types'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Leaf } from 'lucide-react'

interface TeaCardProps {
  tea: Tea
}

export function TeaCard({ tea }: TeaCardProps) {
  return (
    <Card className="group flex flex-col h-full overflow-hidden border-tea-100 bg-white hover:border-tea-300 hover:shadow-lg transition-all duration-300">
      {/* 图片区域 */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-tea-50">
        {tea.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={tea.image_url} 
            alt={tea.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-tea-300 gap-2">
            <Leaf className="h-12 w-12 opacity-50" />
            <span className="text-sm font-medium">暂无图片</span>
          </div>
        )}
        
        {/* 分类标签 - 悬浮在图片右上角 */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-tea-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-tea-100">
            {tea.category}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-start mb-3">
          <Link 
            href={`/teas/${tea.slug}`}
            className="text-xl font-bold hover:underline text-tea-800 group-hover:text-tea-600 transition-colors line-clamp-1"
          >
            {tea.name}
          </Link>
        </div>
        
        <p className="text-earth-600 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
          {tea.description}
        </p>
        
        <div className="pt-4 border-t border-tea-50 mt-auto">
          <Link 
            href={`/teas/${tea.slug}`}
            className="inline-flex items-center text-sm font-medium text-tea-600 hover:text-tea-800 transition-colors group/link"
          >
            查看详情 
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
