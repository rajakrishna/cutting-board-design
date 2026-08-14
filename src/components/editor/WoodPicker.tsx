import { WOODS } from '../../domain/woods'
import type { Wood } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (woodId: string) => void
  foodSafeOnly?: boolean
  allowedIds?: string[] | null
  compact?: boolean
}

export function WoodPicker({ value, onChange, foodSafeOnly, allowedIds, compact }: Props) {
  let list: Wood[] = WOODS
  if (foodSafeOnly) list = list.filter((w) => w.foodSafe)
  if (allowedIds && allowedIds.length) list = list.filter((w) => allowedIds.includes(w.id))

  const groups = ['domestic', 'exotic', 'accent', 'custom'] as const

  return (
    <div className={cn('flex flex-col gap-2', compact && 'gap-1.5')}>
      {groups.map((g) => {
        const items = list.filter((w) => w.group === g)
        if (!items.length) return null
        return (
          <div key={g}>
            <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</div>
            <div className="flex flex-wrap gap-1">
              {items.map((w) => {
                const selected = w.id === value
                const caution = w.openPore || w.oily || w.id === 'soft-maple'
                return (
                  <Button
                    key={w.id}
                    type="button"
                    size="xs"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => onChange(w.id)}
                    title={w.notes}
                    className="h-7 gap-1.5 px-2"
                  >
                    <span
                      className="inline-block size-3.5 shrink-0 rounded-sm border border-border"
                      style={{ background: w.color }}
                      aria-hidden
                    />
                    <span>{w.name}</span>
                    {caution && (
                      <span className={selected ? 'text-primary-foreground/80' : 'text-destructive'}>!</span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
