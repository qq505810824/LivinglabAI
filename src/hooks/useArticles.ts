'use client'

import { useState, useEffect } from 'react'
import type { Article } from '@/types'
import articlesData from '@/datas/articles.json'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// In-memory cache
const cache = {
  list: {
    data: null as Article[] | null,
    timestamp: 0
  },
  items: new Map<string, { data: Article | null, timestamp: number }>()
}

export function useArticles() {
  const isCacheValid = cache.list.data && (Date.now() - cache.list.timestamp < CACHE_DURATION)
  
  const [articles, setArticles] = useState<Article[]>(isCacheValid ? cache.list.data! : [])
  const [loading, setLoading] = useState(!isCacheValid)

  useEffect(() => {
    if (isCacheValid) return

    const timer = setTimeout(() => {
      const data = articlesData as Article[]
      // Update cache
      cache.list = {
        data,
        timestamp: Date.now()
      }
      setArticles(data)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isCacheValid])

  return { articles, loading }
}

export function useArticleBySlug(slug: string) {
  // Check if item is in item cache
  const cachedItem = cache.items.get(slug)
  const isItemCacheValid = cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION)

  // Check if item is in list cache (if list cache is valid)
  const isListCacheValid = cache.list.data && (Date.now() - cache.list.timestamp < CACHE_DURATION)
  const itemFromList = isListCacheValid ? cache.list.data!.find(a => a.slug === slug) : null

  const initialData = isItemCacheValid ? cachedItem!.data : (itemFromList || null)
  const initialLoading = !isItemCacheValid && !itemFromList

  const [article, setArticle] = useState<Article | null>(initialData)
  const [loading, setLoading] = useState(initialLoading)

  useEffect(() => {
    if (!initialLoading) return

    setLoading(true)
    const timer = setTimeout(() => {
      const found = articlesData.find(a => a.slug === slug)
      const data = (found as Article) || null
      
      // Update item cache
      cache.items.set(slug, {
        data,
        timestamp: Date.now()
      })
      
      setArticle(data)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [slug, initialLoading])

  return { article, loading }
}
