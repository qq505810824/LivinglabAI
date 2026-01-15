'use client'

import { useState, useEffect } from 'react'
import type { Tea } from '@/types'
import teasData from '@/datas/teas.json'

export function useTeas() {
  const [teas, setTeas] = useState<Tea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      setTeas(teasData as Tea[])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return { teas, loading }
}

export function useTeaBySlug(slug: string) {
  const [tea, setTea] = useState<Tea | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const found = teasData.find(t => t.slug === slug)
      setTea((found as Tea) || null)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [slug])

  return { tea, loading }
}
