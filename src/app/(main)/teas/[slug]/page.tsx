'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Thermometer, Clock, MapPin, Loader2, Leaf } from 'lucide-react'
import { useTeaBySlug, useTeas } from '@/hooks/useTeas'
import { TeaCard } from '@/components/tea/TeaCard'

export default function TeaDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tea, loading } = useTeaBySlug(slug)
  const { teas: allTeas } = useTeas()

  // 获取推荐茶叶（同类别的其他茶叶，最多3个）
  const recommendedTeas = allTeas
    .filter(t => t.category_id === tea?.category_id && t.id !== tea?.id)
    .slice(0, 3)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tea-500" />
      </div>
    )
  }

  if (!tea) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">未找到该茶叶</h1>
        <Link href="/teas" className="text-tea-500 hover:underline">
          返回列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earth-50/50 pb-20">
      {/* 顶部 Hero 区域 */}
      <div className="relative h-[400px] w-full bg-tea-900 overflow-hidden">
        {tea.image_url && (
          <>
            <div className="absolute inset-0 bg-black/40 z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={tea.image_url} 
              alt={tea.name} 
              className="w-full h-full object-cover blur-sm scale-110"
            />
          </>
        )}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-4">
          <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-white/20">
            {tea.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{tea.name}</h1>
          <div className="flex items-center gap-6 text-white/90">
            {tea.origin && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{tea.origin}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-30">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <Link 
            href="/teas" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>

          {/* 主内容卡片 */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-8 md:p-12">
              {/* 冲泡参数栏 */}
              <div className="flex flex-wrap gap-8 p-6 bg-tea-50 rounded-xl mb-10 border border-tea-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-tea-600 shadow-sm">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider font-medium">冲泡温度</p>
                    <p className="text-tea-900 font-bold text-lg">{tea.brewing_temp || '--'}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-tea-600 shadow-sm">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider font-medium">冲泡时间</p>
                    <p className="text-tea-900 font-bold text-lg">{tea.brewing_time || '--'}s</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-tea-600 shadow-sm">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider font-medium">茶类</p>
                    <p className="text-tea-900 font-bold text-lg">{tea.category}</p>
                  </div>
                </div>
              </div>

              {/* 正文内容 */}
              <article className="prose prose-lg prose-tea max-w-none">
                <div className="first-letter:text-5xl first-letter:font-bold first-letter:text-tea-600 first-letter:mr-3 first-letter:float-left">
                  {tea.description}
                </div>
                
                {/* 模拟更多内容 - 实际项目中这些内容应来自数据库 */}
                <h3 className="text-2xl font-bold text-tea-800 mt-8 mb-4">产地环境</h3>
                <p className="text-earth-600 leading-relaxed">
                  {tea.origin}，这里云雾缭绕，雨量充沛，土壤肥沃，为{tea.name}的生长提供了得天独厚的自然条件。
                  茶树生长在这样的环境中，吸收天地之灵气，叶片肥厚，内含物质丰富。
                </p>

                <h3 className="text-2xl font-bold text-tea-800 mt-8 mb-4">品质特征</h3>
                <p className="text-earth-600 leading-relaxed">
                  成品茶外形条索紧结，色泽鲜润。冲泡后汤色明亮，香气高长，滋味醇厚甘鲜，叶底嫩绿匀整。
                  细细品味，能感受到独特的地域香韵，回甘持久，令人心旷神怡。
                </p>
              </article>
            </div>
          </div>

          {/* 推荐茶叶 */}
          {recommendedTeas.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-tea-800 mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-tea-500 rounded-full inline-block"></span>
                猜你喜欢
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedTeas.map((item) => (
                  <TeaCard key={item.id} tea={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
