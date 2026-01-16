'use client'

import { useState } from 'react'
import { useTeaTalks } from '@/hooks/useTeaTalks'
import { TeaTalkCard } from '@/components/tea-talk/TeaTalkCard'
import { TeaTalkForm } from '@/components/tea-talk/TeaTalkForm'
import { Loader2, ChevronLeft, ChevronRight, Coffee } from 'lucide-react'

export default function TeaTalkPage() {
  const { loading, getTalksByPage, addTalk, likeTalk, dislikeTalk } = useTeaTalks()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data: currentTalks, totalPages } = getTalksByPage(currentPage, pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-tea-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      {/* Header Section */}
      <div className="relative bg-tea-900 text-white py-24 mb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-tea-900/70 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=2000" 
            alt="Tea Background" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-20">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Coffee className="w-8 h-8 text-tea-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-sm">喝茶吧</h1>
          <p className="text-tea-50 text-lg max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
            以茶会友，品味人生。在这里分享你的茶语感悟，发现更多有趣的茶友。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Content Grid */}
        <div className="flex flex-col gap-6 mb-12">
          {currentTalks.map(talk => (
            <TeaTalkCard
              key={talk.id}
              talk={talk}
              onLike={likeTalk}
              onDislike={dislikeTalk}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-16">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-tea-200 text-tea-600 hover:bg-tea-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-tea-900 font-medium">
              第 {currentPage} 页 / 共 {totalPages} 页
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-tea-200 text-tea-600 hover:bg-tea-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Submission Form */}
        <div className="max-w-4xl mx-auto">
          <TeaTalkForm onSubmit={addTalk} />
        </div>
      </div>
    </div>
  )
}
