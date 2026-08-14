import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  fractions?: number[]
  compact?: boolean
}

function fracLabel(f: number): string {
  if (f === 0.125) return '1/8'
  if (f === 0.0625) return '1/16'
  if (f === 0.25) return '1/4'
  if (f === 0.09375) return '3/32'
  return String(f)
}

export function NumberField({
  label,
  value,
  onChange,
  step = 0.125,
  min = 0,
  max = 100,
  fractions,
  compact,
}: Props) {
  const labelId = `nf-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  return (
    <label className={cn('flex flex-col gap-1 text-sm', compact && 'gap-0.5')}>
      <span className="text-xs text-muted-foreground" id={labelId}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 1000) / 1000))}
          aria-label={`Decrease ${label}`}
        >
          −
        </Button>
        <Input
          className="h-8 text-center tabular-nums"
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          aria-labelledby={labelId}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.min(max, Math.round((value + step) * 1000) / 1000))}
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
      </div>
      {fractions && (
        <div className="flex flex-wrap gap-1">
          {fractions.map((f) => (
            <Button
              key={f}
              type="button"
              variant={value === f ? 'default' : 'outline'}
              size="xs"
              onClick={() => onChange(f)}
            >
              {fracLabel(f)}
            </Button>
          ))}
        </div>
      )}
    </label>
  )
}
