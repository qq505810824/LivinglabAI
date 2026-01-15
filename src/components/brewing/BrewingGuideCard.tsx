import { Card } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface BrewingStep {
  label: string
  value: string
  description?: string
}

interface BrewingGuideCardProps {
  title: string
  steps: BrewingStep[]
  icon?: LucideIcon
}

export function BrewingGuideCard({ title, steps, icon: Icon }: BrewingGuideCardProps) {
  return (
    <Card className="border-tea-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-tea-50 pb-4">
          {Icon && (
            <div className="p-2 bg-tea-50 rounded-lg text-tea-600">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <h2 className="text-xl font-bold text-tea-800">{title}</h2>
        </div>
        
        <ul className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-tea-50/50 transition-colors">
              <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-tea-400" />
              <div>
                <span className="font-semibold text-tea-700 block mb-1">{step.label}</span>
                <span className="text-earth-600 text-sm leading-relaxed block">{step.value}</span>
                {step.description && (
                  <p className="text-xs text-earth-400 mt-1">{step.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
