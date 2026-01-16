import Link from 'next/link'
import { FeatureCard } from '@/components/feature/FeatureCard'
import { Leaf, BookOpen, Coffee, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* 背景图层 */}
        <div className="absolute inset-0 z-0">
          {/* 这里使用 CSS 渐变模拟高质量背景图，实际项目中应替换为真实图片 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://img2.baidu.com/it/u=2299539294,1644579123&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667"
            alt="Tea Ceremony" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* 内容层 */}
        <div className="container mx-auto px-4 relative z-20 text-center text-white">
          <span className="inline-block px-4 py-1.5 mb-6 border border-white/30 rounded-full bg-white/10 backdrop-blur-md text-sm font-light tracking-widest uppercase">
            EST. 2026 · Tea Culture Hub
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
            一杯好茶<br className="md:hidden" /> <span className="font-light italic text-tea-100">润泽</span>生活
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            茶，是自然的馈赠，是时间的沉淀。从山野到杯盏，我们带您探索东方树叶的千年奥秘，让茶香成为生活不可或缺的仪式感。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/teas" 
              className="group bg-tea-600 text-white px-10 py-4 rounded-full font-medium hover:bg-tea-500 transition-all duration-300 shadow-lg hover:shadow-tea-500/30 flex items-center justify-center gap-2"
            >
              浏览茶库
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/culture" 
              className="group bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-medium hover:bg-white hover:text-tea-900 transition-all duration-300 flex items-center justify-center"
            >
              探索文化
            </Link>
          </div>
        </div>
      </section>

      {/* 理念展示区 */}
      <section className="py-24 bg-earth-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://img2.baidu.com/it/u=348003088,289864234&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1067" 
                  alt="Tea Leaves" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tea-500/10 rounded-full blur-3xl" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-tea-900 leading-tight">
                万物之灵 <br/>
                <span className="text-tea-600">汇聚一杯香茗</span>
              </h2>
              <p className="text-earth-600 leading-relaxed text-lg">
                茶不仅仅是一种饮品，更是一种生活态度。它连接着人与自然，连接着过去与未来。在这里，我们不只谈论茶叶的分类与等级，更关注每一杯茶背后的故事与情感。
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-4xl font-bold text-tea-700 mb-2">6+</h4>
                  <p className="text-earth-500 font-medium">六大茶类全覆盖</p>
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-tea-700 mb-2">100+</h4>
                  <p className="text-earth-500 font-medium">精选名茶收录</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能区 */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-tea-50/50 skew-x-12 translate-x-1/4" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-tea-600 font-medium tracking-wider uppercase text-sm mb-3 block">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-tea-900 mb-6">全方位的茶文化体验</h2>
            <p className="text-earth-600 text-lg">
              无论您是初学者还是资深茶客，我们都为您准备了丰富的知识盛宴。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="茶叶百科"
              description="建立您的茶叶知识库。从绿茶的清鲜到普洱的醇厚，收录六大茶类详细信息，带你认识每一片树叶的故事。"
              icon={Leaf}
              href="/teas"
              linkText="浏览茶库"
            />

            <FeatureCard 
              title="茶文化"
              description="穿越千年的文化之旅。深入了解茶的历史渊源、茶道礼仪与文人雅士的茶事，感受东方美学的独特魅力。"
              icon={BookOpen}
              href="/culture"
              linkText="阅读文章"
            />

            <FeatureCard 
              title="冲泡指南"
              description="成为生活的茶艺师。掌握正确的冲泡方法，从水温到时间的精准把控，激发每一款茶的最佳风味。"
              icon={Coffee}
              href="/brewing"
              linkText="学习冲泡"
            />
          </div>
        </div>
      </section>

      {/* 茶人感悟区域 */}
      <section className="py-24 bg-tea-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            {/* 图片区域 */}
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-tea-200 rounded-tr-[60px] rounded-bl-[60px] transform translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/lyl_tea.jpeg" 
                  alt="茶人品茗" 
                  className="relative z-10 w-full h-[400px] object-cover rounded-tr-[60px] rounded-bl-[60px] shadow-xl"
                />
              </div>
            </div>
            
            {/* 文字区域 */}
            <div className="w-full md:w-1/2 space-y-8 order-1 md:order-2">
              <div className="flex items-center gap-4 text-tea-600">
                <span className="h-px w-12 bg-tea-600"></span>
                <span className="uppercase tracking-widest text-sm font-medium">茶与生活</span>
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-serif text-tea-900 leading-relaxed italic relative">
                <span className="absolute -top-4 -left-6 text-6xl text-tea-200 opacity-50">"</span>
                喝茶当于瓦屋纸窗之下，清泉绿茶，用素雅的陶瓷茶具，同二三人共饮，得半日之闲，可抵十年的尘梦。
              </blockquote>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="h-12 w-12 rounded-full bg-tea-200 overflow-hidden">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/lyl.jpg" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-bold text-tea-900">李燕玲</p>
                  <p className="text-earth-500 text-sm">《我爱喝茶》</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 每日一语 */}
      <section className="py-20 bg-tea-900 text-white text-center">
        <div className="container mx-auto px-4">
          <Coffee className="w-12 h-12 mx-auto mb-8 text-tea-300 opacity-80" />
          <blockquote className="text-2xl md:text-4xl font-serif italic leading-relaxed max-w-4xl mx-auto mb-8 opacity-90">
            "茶者，南方之嘉木也。"
          </blockquote>
          <cite className="text-tea-300 font-medium tracking-wide not-italic">— 陆羽《茶经》</cite>
        </div>
      </section>
    </div>
  )
}
