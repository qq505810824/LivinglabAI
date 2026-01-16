import { useState, useEffect } from 'react'
import teaTalksData from '@/datas/tea_talks.json'

export interface TeaTalkUser {
  name: string
  avatar: string
}

export interface TeaTalk {
  id: string
  title: string
  content: string
  image_url: string
  user: TeaTalkUser
  created_at: string
  likes: number
  dislikes: number
}

export function useTeaTalks() {
  const [talks, setTalks] = useState<TeaTalk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Ensure data is sorted by created_at desc
      const sortedData = [...(teaTalksData as TeaTalk[])].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setTalks(sortedData)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getTalksByPage = (page: number, pageSize: number = 20) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: talks.slice(start, end),
      total: talks.length,
      totalPages: Math.ceil(talks.length / pageSize)
    }
  }

  const addTalk = (title: string, content: string, imageUrl: string) => {
    const newTalk: TeaTalk = {
      id: Date.now().toString(),
      title,
      content,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600', // Default image
      user: {
        name: '茶友_' + Math.floor(Math.random() * 1000),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      },
      created_at: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    }
    setTalks([newTalk, ...talks])
    return newTalk
  }

  const likeTalk = (id: string) => {
    setTalks(prev => prev.map(talk => 
      talk.id === id ? { ...talk, likes: talk.likes + 1 } : talk
    ))
  }

  const dislikeTalk = (id: string) => {
    setTalks(prev => prev.map(talk => 
      talk.id === id ? { ...talk, dislikes: talk.dislikes + 1 } : talk
    ))
  }

  return {
    talks,
    loading,
    getTalksByPage,
    addTalk,
    likeTalk,
    dislikeTalk
  }
}
