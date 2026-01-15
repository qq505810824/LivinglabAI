'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useArticleBySlug } from '@/hooks/useArticles'

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const { article, loading } = useArticleBySlug(slug)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tea-500" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">未找到该文章</h1>
        <Link href="/culture" className="text-tea-500 hover:underline">
          返回列表
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/culture" className="inline-flex items-center text-gray-500 hover:text-tea-500 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回文章列表
      </Link>
      
      <article>
        <h1 className="text-4xl font-bold text-tea-700 mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-500 mb-8 border-b pb-4">
          <span>{article.published_at ? formatDate(article.published_at) : ''}</span>
        </div>

        <div className="prose prose-tea max-w-none text-gray-600">
           {/* In a real app, use a markdown parser or sanitizer */}
          <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </div>
      </article>
    </div>
  )
}
