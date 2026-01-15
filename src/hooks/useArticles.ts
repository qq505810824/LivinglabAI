'use client'

import { useState, useEffect } from 'react'
import type { Article } from '@/types'
import articlesData from '@/datas/articles.json'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      setArticles(articlesData as Article[])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return { articles, loading }
}

export function useArticleBySlug(slug: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const found = articlesData.find(a => a.slug === slug)
      setArticle((found as Article) || null)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [slug])

  return { article, loading }
}
