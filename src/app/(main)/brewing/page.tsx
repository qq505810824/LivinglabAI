import { BrewingGuideCard } from '@/components/brewing/BrewingGuideCard'
import { Coffee, Thermometer, Clock, Droplets } from 'lucide-react'

export default function BrewingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-tea-800 mb-4">冲泡指南</h1>
        <p className="text-earth-600">
          一杯好茶，三分看茶，七分看泡。掌握正确的冲泡技艺，方能不负好茶。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <BrewingGuideCard 
          title="通用冲泡法则"
          icon={Coffee}
          steps={[
            { label: "水质选择", value: "建议使用纯净水或山泉水", description: "避免使用自来水，氯气会破坏茶香" },
            { label: "投茶量", value: "一般建议茶水比 1:50", description: "即 3g 茶叶配 150ml 水，可根据个人口味微调" },
            { label: "温杯洁具", value: "用沸水烫洗茶具", description: "提高茶具温度，利于茶香激发" }
          ]}
        />

        <BrewingGuideCard 
          title="水温控制"
          icon={Thermometer}
          steps={[
            { label: "绿茶 / 黄茶", value: "80-85℃", description: "水温过高会烫熟茶叶，导致苦涩" },
            { label: "红茶 / 花茶", value: "90-95℃", description: "高温更能激发香气" },
            { label: "乌龙 / 普洱 / 黑茶", value: "100℃ (沸水)", description: "必须滚水冲泡，才能析出茶韵" }
          ]}
        />

        <BrewingGuideCard 
          title="注水方式"
          icon={Droplets}
          steps={[
            { label: "定点注水", value: "适合细嫩绿茶", description: "避免直冲茶叶，沿杯壁注水" },
            { label: "环绕注水", value: "适合红茶、乌龙茶", description: "让茶叶充分浸润" },
            { label: "高冲低斟", value: "激发茶香", description: "高处注水激香，低处出汤留韵" }
          ]}
        />

        <BrewingGuideCard 
          title="时间把控"
          icon={Clock}
          steps={[
            { label: "润茶（洗茶）", value: "3-5秒", description: "快速出汤，唤醒茶叶" },
            { label: "前三泡", value: "10-20秒", description: "随泡数增加，适当延长" },
            { label: "后续冲泡", value: "每泡增加 5-10秒", description: "根据茶汤浓度灵活调整" }
          ]}
        />
      </div>
    </div>
  )
}
