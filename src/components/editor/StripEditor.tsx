import { useBoardStore } from '../../state/boardStore'
import { WOODS, getWood } from '../../domain/woods'
import { NumberStepper } from './NumberStepper'
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
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Strips</h2>
        <Button type="button" size="sm" variant="ghost" onClick={addStrip}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {board.strips.map((s, i) => {
          const isSelected = selectedStripId === s.id

          return (
            <div
              key={s.id}
              className={cn(
                'group flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors',
                isSelected
                  ? 'border-primary bg-accent'
                  : 'border-border bg-background hover:border-border-strong',
              )}
              onClick={() => selectStrip(isSelected ? null : s.id)}
            >
              <span className="w-4 text-center text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>

              <span
                className="size-3.5 shrink-0 rounded-sm border border-border"
                style={{ backgroundColor: getWood(s.woodId)?.color ?? '#94a3b8' }}
                aria-hidden
              />

              <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={s.woodId}
                  onValueChange={(woodId) => updateStrip(s.id, { woodId })}
                >
                  <SelectTrigger size="sm" className="w-full px-2 text-xs">
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

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <NumberStepper
                  value={s.width}
                  onChange={(width) => updateStrip(s.id, { width })}
                  step={0.125}
                  min={0.25}
                  max={8}
                  unit="inches"
                  label={`strip ${i + 1} width`}
                />
              </div>

              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  removeStrip(s.id)
                }}
                disabled={board.strips.length <= 1}
                aria-label={`Remove strip ${i + 1}`}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
