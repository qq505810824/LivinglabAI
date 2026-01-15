'use client'

import { useState, useMemo } from 'react'
import { TeaCard } from '@/components/tea/TeaCard'
import { useTeas } from '@/hooks/useTeas'
import { Loader2, Search } from 'lucide-react'
import categoriesData from '@/datas/categories.json'
import { cn } from '@/lib/utils'

export default function TeasPage() {
  const { teas, loading } = useTeas()
  const [selectedCategory, setSelectedCategory] = useState(categoriesData[0].id)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 获取当前选中的一级分类对象
  const currentCategory = categoriesData.find(c => c.id === selectedCategory)

  // 过滤茶叶数据
  const filteredTeas = useMemo(() => {
    return teas.filter(tea => {
      // 搜索过滤
      const matchesSearch = tea.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tea.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      // 分类过滤
      // 如果选中了二级分类，则精确匹配二级分类
      if (selectedSubcategory) {
        return tea.subcategory_id === selectedSubcategory
      }
      // 否则匹配一级分类
      return tea.category_id === selectedCategory
    })
  }, [teas, searchQuery, selectedCategory, selectedSubcategory])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null) // 切换一级分类时重置二级分类
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tea-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-tea-700">茶叶百科</h1>
        
        {/* 搜索框 */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
          <input 
            type="text" 
            placeholder="搜索茶叶..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-tea-200 bg-white pl-10 pr-4 py-2 text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-tea-500 transition-all"
          />
        </div>
      </div>

      {/* 一级分类 */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categoriesData.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                selectedCategory === category.id
                  ? "bg-tea-500 text-white shadow-md"
                  : "bg-tea-50 text-tea-700 hover:bg-tea-100"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 二级分类 */}
      {currentCategory && currentCategory.subcategories.length > 0 && (
        <div className="mb-8 p-4 bg-tea-50/50 rounded-xl border border-tea-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-all border",
                selectedSubcategory === null
                  ? "bg-white border-tea-500 text-tea-700 font-medium shadow-sm"
                  : "bg-transparent border-transparent text-earth-600 hover:bg-white hover:text-tea-600"
              )}
            >
              全部
            </button>
            {currentCategory.subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-all border",
                  selectedSubcategory === sub.id
                    ? "bg-white border-tea-500 text-tea-700 font-medium shadow-sm"
                    : "bg-transparent border-transparent text-earth-600 hover:bg-white hover:text-tea-600"
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 茶叶列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeas.map((tea) => (
          <TeaCard key={tea.id} tea={tea} />
        ))}
      </div>
      
      {/* 空状态 */}
      {filteredTeas.length === 0 && (
        <div className="text-center py-20 bg-tea-50/30 rounded-xl border border-dashed border-tea-200">
          <p className="text-earth-500 mb-2">未找到相关茶叶</p>
          <button 
            onClick={() => {
              setSearchQuery('')
              setSelectedSubcategory(null)
            }}
            className="text-tea-600 text-sm hover:underline"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  )
}
