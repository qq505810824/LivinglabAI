'use client'

import { ArticleCard } from '@/components/article/ArticleCard'
import { useArticles } from '@/hooks/useArticles'
import { Loader2 } from 'lucide-react'

export default function CulturePage() {
  const { articles, loading } = useArticles()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tea-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-tea-800 mb-4">茶文化</h1>
        <p className="text-earth-600">
          品读茶的故事，感受历史的温度，在文字中体悟茶道的精神内核。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      {articles.length === 0 && (
        <div className="text-center py-20 bg-tea-50/30 rounded-xl border border-dashed border-tea-200">
          <p className="text-earth-500">暂无文章</p>
        </div>
      )}
    </div>
  )
}
