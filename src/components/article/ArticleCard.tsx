import Link from 'next/link'
import { Article } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Calendar, Image as ImageIcon } from 'lucide-react'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group flex flex-col h-full border-tea-100 bg-white hover:border-tea-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* 图片区域 - 可选 */}
      {article.image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-tea-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={article.image_url} 
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-2 text-xs text-earth-500 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{article.published_at ? formatDate(article.published_at) : '暂无日期'}</span>
        </div>

        <h2 className="text-xl font-bold text-tea-800 mb-3 group-hover:text-tea-600 transition-colors line-clamp-2">
          <Link href={`/culture/${article.slug}`} className="hover:underline decoration-tea-300 underline-offset-4">
            {article.title}
          </Link>
        </h2>
        
        <p className="text-earth-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {article.summary || article.content?.substring(0, 150).replace(/<[^>]+>/g, '')}...
        </p>
        
        <div className="pt-4 border-t border-tea-50 mt-auto">
          <Link 
            href={`/culture/${article.slug}`} 
            className="inline-flex items-center text-sm font-medium text-tea-600 hover:text-tea-800 transition-colors group/link"
          >
            阅读全文 <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
