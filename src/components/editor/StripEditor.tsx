import { useBoardStore } from '../../state/boardStore'
import { getWood, WOODS } from '../../domain/woods'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

export function StripEditor() {
  const board = useBoardStore((s) => s.board)
  const selectedStripId = useBoardStore((s) => s.selectedStripId)
  const selectStrip = useBoardStore((s) => s.selectStrip)
  const updateStrip = useBoardStore((s) => s.updateStrip)
  const addStrip = useBoardStore((s) => s.addStrip)
  const removeStrip = useBoardStore((s) => s.removeStrip)
  const inventory = useBoardStore((s) => s.inventory)
  const only = useBoardStore((s) => s.onlyInventorySpecies)

  const allowed = only && inventory.length ? inventory.map((i) => i.woodId) : null
  const woodList = WOODS.filter((w) => w.foodSafe && (!allowed || allowed.includes(w.id)))

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium">Strips</h2>
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={addStrip}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="space-y-1">
        {board.strips.map((s, i) => {
          const wood = getWood(s.woodId)
          const isSelected = selectedStripId === s.id

          return (
            <div
              key={s.id}
              className={cn(
                'group flex items-center gap-1.5 rounded border bg-background px-1.5 py-1 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              )}
              onClick={() => selectStrip(isSelected ? null : s.id)}
            >
              <span className="w-4 text-center text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>

              <span
                className="size-4 shrink-0 rounded-sm border border-border/50"
                style={{ backgroundColor: wood?.color ?? '#ccc' }}
              />

              <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={s.woodId}
                  onValueChange={(woodId) => updateStrip(s.id, { woodId })}
                >
                  <SelectTrigger className="h-7 w-full border border-border bg-white px-2 text-xs shadow-none focus:ring-1 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['domestic', 'exotic', 'accent'].map((group) => {
                      const items = woodList.filter((w) => w.group === group)
                      if (!items.length) return null
                      return (
                        <SelectGroup key={group}>
                          <SelectLabel className="capitalize">{group}</SelectLabel>
                          {items.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-3 rounded-sm"
                                  style={{ backgroundColor: w.color }}
                                />
                                {w.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={s.width}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (!Number.isNaN(v) && v >= 0.25 && v <= 8) {
                      updateStrip(s.id, { width: v })
                    }
                  }}
                  step={0.125}
                  min={0.25}
                  max={8}
                  className="h-7 w-14 rounded border border-border bg-white text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">"</span>
              </div>

              <button
                type="button"
                className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeStrip(s.id)
                }}
                disabled={board.strips.length <= 1}
              >
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
