'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useArticleBySlug } from '@/hooks/useArticles'
import { PageContainer } from '@/components/common/PageContainer'

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const { article, loading } = useArticleBySlug(slug)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-tea-600" />
          <p className="text-tea-500 font-medium">正在沏茶中...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-earth-700 mb-4">未找到该文章</h1>
          <p className="text-earth-500 mb-8">这篇文章似乎已经随风而去了...</p>
          <Link 
            href="/culture" 
            className="inline-flex items-center px-6 py-3 rounded-full bg-tea-600 text-white hover:bg-tea-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文章列表
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <article className="min-h-screen bg-earth-50/30">
      {/* Hero Header with Image */}
      <div className="relative w-full h-[30vh] md:h-[40vh] bg-earth-900 overflow-hidden">
        {article.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover opacity-60 blur-sm scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tea-900 to-earth-900 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Title Content over Image */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="container mx-auto max-w-4xl">
            <Link 
              href="/culture" 
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors text-sm font-medium backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回文章列表
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight text-shadow-sm">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90 font-light">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.published_at ? formatDate(article.published_at) : '暂无日期'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>约 {Math.ceil((article.content?.length || 0) / 300)} 分钟阅读</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageContainer>
        <div className="max-w-3xl mx-auto -mt-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            {/* Full Image Display */}
            {article.image_url && (
              <div className="mb-10 -mx-4 md:-mx-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-auto md:rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Summary Box */}
            {article.summary && (
              <div className="mb-10 p-6 bg-tea-50/50 border-l-4 border-tea-500 rounded-r-lg">
                <p className="text-lg text-tea-800 font-medium italic leading-relaxed">
                  “{article.summary}”
                </p>
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg prose-tea max-w-none 
                prose-headings:text-tea-900 prose-headings:font-bold
                prose-p:text-earth-700 prose-p:leading-8
                prose-a:text-tea-600 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-tea-300 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                prose-strong:text-tea-800
                prose-img:rounded-xl prose-img:shadow-md"
            >
              {/* Note: In a real production app, ensure this content is sanitized */}
              <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
            </div>

            {/* Footer / Share / Tags could go here */}
            <div className="mt-12 pt-8 border-t border-earth-100 flex justify-between items-center">
              <span className="text-earth-400 text-sm">
                © 茶韵 Tea Culture Hub
              </span>
              <div className="flex gap-4">
                {/* Social Share Placeholders */}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </article>
  )
}
