import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  unit?: 'inches' | 'degrees'
}

function formatValue(value: number, unit?: string): string {
  if (unit === 'inches') {
    return `${value}″`
  }
  if (unit === 'degrees') {
    return `${value}°`
  }
  return String(value)
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100,
  unit,
}: Props) {
  const decrement = () => {
    onChange(Math.max(min, Math.round((value - step) * 1000) / 1000))
  }
  const increment = () => {
    onChange(Math.min(max, Math.round((value + step) * 1000) / 1000))
  }

  return (
    <div className="inline-flex items-center rounded-md border border-input bg-background text-xs">
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-l-md border-r border-input hover:bg-accent disabled:opacity-50"
        onClick={decrement}
        disabled={value <= min}
      >
        <Minus className="size-3" />
      </button>
      <span
        className={cn(
          'flex h-6 min-w-[44px] items-center justify-center px-1 tabular-nums',
          unit === 'degrees' && 'min-w-[36px]'
        )}
      >
        {formatValue(value, unit)}
      </span>
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-r-md border-l border-input hover:bg-accent disabled:opacity-50"
        onClick={increment}
        disabled={value >= max}
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}
