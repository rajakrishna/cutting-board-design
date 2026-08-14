import { useState } from 'react'
import { useBoardStore, useDerived } from '../../state/boardStore'
import { WOODS, getWood } from '../../domain/woods'
import type { StockItem } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function InventoryPanel() {
  const inventory = useBoardStore((s) => s.inventory)
  const setInventory = useBoardStore((s) => s.setInventory)
  const only = useBoardStore((s) => s.onlyInventorySpecies)
  const setOnly = useBoardStore((s) => s.setOnlyInventorySpecies)
  const loadPreset = useBoardStore((s) => s.loadPreset)
  const setGrainMode = useBoardStore((s) => s.setGrainMode)
  const { suggestions } = useDerived()

  const [draft, setDraft] = useState<Partial<StockItem>>({
    woodId: 'hard-maple',
    thickness: 1.75,
    width: 6,
    length: 48,
    count: 1,
  })

  const woodList = WOODS.filter((w) => w.foodSafe)

  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex items-center gap-2">
        <Checkbox checked={only} onCheckedChange={(v) => setOnly(v === true)} />
        <span className="text-xs">Only use these species</span>
      </label>

      {/* Add stock form */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          <Select
            value={draft.woodId}
            onValueChange={(v) => setDraft({ ...draft, woodId: v })}
          >
            <SelectTrigger className="h-7 flex-1 border border-border bg-white text-xs focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="Species" />
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
                          <span className="size-3 rounded-sm" style={{ backgroundColor: w.color }} />
                          {w.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )
              })}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => {
              if (!draft.woodId) return
              const item: StockItem = {
                id: uid(),
                woodId: draft.woodId,
                thickness: draft.thickness ?? 1,
                width: draft.width ?? 6,
                length: draft.length ?? 48,
                count: draft.count ?? 1,
              }
              setInventory([...inventory, item])
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="flex gap-1">
          {(['thickness', 'width', 'length', 'count'] as const).map((k) => (
            <div key={k} className="flex-1">
              <div className="mb-0.5 text-center text-[10px] text-muted-foreground">
                {k === 'thickness' ? 'T' : k === 'width' ? 'W' : k === 'length' ? 'L' : 'Qty'}
              </div>
              <Input
                type="number"
                className="h-7 border border-border bg-white px-1 text-center text-xs tabular-nums focus:ring-1 focus:ring-primary"
                value={draft[k] ?? 0}
                onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory list */}
      {inventory.length > 0 && (
        <div className="space-y-0.5">
          {inventory.map((i) => {
            const wood = getWood(i.woodId)
            return (
              <div
                key={i.id}
                className="group flex items-center gap-1.5 rounded px-1 py-1 hover:bg-accent/50"
              >
                <span
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: wood?.color ?? '#ccc' }}
                />
                <span className="min-w-0 flex-1 truncate text-xs">
                  {wood?.name}
                </span>
                <span className="tabular-nums text-[10px] text-muted-foreground">
                  {i.thickness}×{i.width}×{i.length}" ×{i.count}
                </span>
                <button
                  type="button"
                  className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={() => setInventory(inventory.filter((x) => x.id !== i.id))}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            Suggestions
          </div>
          <div className="space-y-1">
            {suggestions.map((s) => (
              <button
                key={s.presetId}
                type="button"
                className="w-full rounded px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
                onClick={() => {
                  if (s.status === 'long-grain') setGrainMode('long')
                  loadPreset(s.presetId)
                }}
              >
                <div className="text-xs font-medium">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
