'use client'

import { useState, useEffect } from 'react'
import type { Tea } from '@/types'
import teasData from '@/datas/teas.json'

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000 // 60 minutes

// In-memory cache
const cache = {
  list: {
    data: null as Tea[] | null,
    timestamp: 0
  },
  items: new Map<string, { data: Tea | null, timestamp: number }>()
}

export function useTeas() {
  const isCacheValid = cache.list.data && (Date.now() - cache.list.timestamp < CACHE_DURATION)

  const [teas, setTeas] = useState<Tea[]>(isCacheValid ? cache.list.data! : [])
  const [loading, setLoading] = useState(!isCacheValid)

  useEffect(() => {
    if (isCacheValid) return

    const timer = setTimeout(() => {
      const data = teasData as Tea[]
      // Update cache
      cache.list = {
        data,
        timestamp: Date.now()
      }
      setTeas(data)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isCacheValid])

  return { teas, loading }
}

export function useTeaBySlug(slug: string) {
  // Check if item is in item cache
  const cachedItem = cache.items.get(slug)
  const isItemCacheValid = cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION)

  // Check if item is in list cache (if list cache is valid)
  const isListCacheValid = cache.list.data && (Date.now() - cache.list.timestamp < CACHE_DURATION)
  const itemFromList = isListCacheValid ? cache.list.data!.find(t => t.slug === slug) : null

  const initialData = isItemCacheValid ? cachedItem!.data : (itemFromList || null)
  const initialLoading = !isItemCacheValid && !itemFromList

  const [tea, setTea] = useState<Tea | null>(initialData)
  const [loading, setLoading] = useState(initialLoading)

  useEffect(() => {
    if (!initialLoading) return

    setLoading(true)
    const timer = setTimeout(() => {
      const found = teasData.find(t => t.slug === slug)
      const data = (found as Tea) || null
      
      // Update item cache
      cache.items.set(slug, {
        data,
        timestamp: Date.now()
      })

      setTea(data)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [slug, initialLoading])

  return { tea, loading }
}
