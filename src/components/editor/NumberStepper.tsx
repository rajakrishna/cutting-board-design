import { formatInches } from '../../domain/cutList'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  unit?: 'inches' | 'degrees'
  label?: string
  className?: string
}

function formatValue(value: number, unit?: string): string {
  if (unit === 'inches') {
    return formatInches(Math.round(value * 1000) / 1000)
  }
  if (unit === 'degrees') {
    return `${Math.round(value * 10) / 10}°`
  }
  const rounded = Math.round(value * 1000) / 1000
  return String(rounded)
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100,
  unit,
  label,
  className,
}: Props) {
  const decrement = () => {
    onChange(Math.max(min, Math.round((value - step) * 1000) / 1000))
  }
  const increment = () => {
    onChange(Math.min(max, Math.round((value + step) * 1000) / 1000))
  }

  return (
    <div className={cn('inline-flex items-center rounded-md border border-input bg-background text-xs', className)}>
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-l-md border-r border-input hover:bg-accent disabled:opacity-50"
        onClick={decrement}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
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
        aria-label={label ? `Increase ${label}` : 'Increase'}
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}
