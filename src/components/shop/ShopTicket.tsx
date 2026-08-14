import { useBoardStore, useDerived } from '../../state/boardStore'
import { getWood } from '../../domain/woods'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function ShopTicket() {
  const board = useBoardStore((s) => s.board)
  const patchSettings = useBoardStore((s) => s.patchSettings)
  const advanced = useBoardStore((s) => s.advanced)
  const setAdvanced = useBoardStore((s) => s.setAdvanced)
  const { summary, invCompare } = useDerived()
  const [extrasOpen, setExtrasOpen] = useState(false)

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Stock Type */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Stock</div>
          <ToggleGroup
            type="single"
            value={board.settings.stockMode}
            onValueChange={(m) => {
              if (m === 'rough' || m === 's4s') patchSettings({ stockMode: m })
            }}
            variant="outline"
            className="w-full"
          >
            <ToggleGroupItem value="rough" className="flex-1">
              Rough
            </ToggleGroupItem>
            <ToggleGroupItem value="s4s" className="flex-1">
              S4S
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Stats Row */}
        {board.grainMode === 'end' && (
          <div className="mb-4 flex text-sm">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Weight</div>
              <div className="font-medium">~{summary.weightLb} lb</div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-xs text-muted-foreground">Clamps</div>
              <div className="font-medium">{summary.clampCount}</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {summary.warnings.length > 0 && (
          <div className="mb-4 space-y-2">
            {summary.warnings.map((w) => (
              <div
                key={w.id}
                className={`rounded-md p-3 text-sm ${
                  w.level === 'warn'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {w.message}
              </div>
            ))}
          </div>
        )}

        {/* Inventory */}
        {invCompare.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Inventory</div>
            <div className="space-y-1">
              {invCompare.map((c) => (
                <div key={c.woodId} className="flex items-center justify-between text-sm">
                  <span className={c.enough ? 'text-green-600' : 'text-amber-500'}>
                    {c.enough ? '✓' : '!'} {getWood(c.woodId)?.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.have.toFixed(1)} / {c.need.toFixed(1)} bf
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Section */}
        <Collapsible open={advanced} onOpenChange={setAdvanced} className="mb-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Advanced
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${advanced ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pb-4">
            {/* Kerf */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm">Kerf</span>
                <Input
                  type="number"
                  value={board.settings.kerf}
                  onChange={(e) => patchSettings({ kerf: Number(e.target.value) || 0.125 })}
                  step={0.03125}
                  className="h-8 w-20 border border-border bg-white text-center"
                />
              </div>
              <div className="flex gap-1">
                {[0.0625, 0.09375, 0.125].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => patchSettings({ kerf: p })}
                    className={`rounded px-2 py-1 text-xs ${
                      Math.abs(board.settings.kerf - p) < 0.001
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p === 0.0625 ? '1/16' : p === 0.09375 ? '3/32' : '1/8'}
                  </button>
                ))}
              </div>
            </div>

            {/* Flatten */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm">Flatten</span>
                <Input
                  type="number"
                  value={board.settings.flattenAllowance}
                  onChange={(e) => patchSettings({ flattenAllowance: Number(e.target.value) || 0 })}
                  step={0.0625}
                  className="h-8 w-20 border border-border bg-white text-center"
                />
              </div>
              <div className="flex gap-1">
                {[0.0625, 0.125, 0.25].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => patchSettings({ flattenAllowance: p })}
                    className={`rounded px-2 py-1 text-xs ${
                      Math.abs(board.settings.flattenAllowance - p) < 0.001
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p === 0.0625 ? '1/16' : p === 0.125 ? '1/8' : '1/4'}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Thickness */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm">Panel thickness</span>
                <Input
                  type="number"
                  value={board.settings.panelThickness}
                  onChange={(e) => patchSettings({ panelThickness: Number(e.target.value) || 1 })}
                  step={0.125}
                  className="h-8 w-20 border border-border bg-white text-center"
                />
              </div>
              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => patchSettings({ panelThickness: p })}
                    className={`rounded px-2 py-1 text-xs ${
                      Math.abs(board.settings.panelThickness - p) < 0.001
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Length */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Extra length</span>
              <Input
                type="number"
                value={board.settings.extraLength}
                onChange={(e) => patchSettings({ extraLength: Number(e.target.value) || 0 })}
                step={0.5}
                className="h-8 w-20 border border-border bg-white text-center"
              />
            </div>

            {/* Planer Width */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Planer width</span>
              <Input
                type="number"
                value={board.settings.planerWidth}
                onChange={(e) => patchSettings({ planerWidth: Number(e.target.value) || 13 })}
                step={1}
                className="h-8 w-20 border border-border bg-white text-center"
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Quantity</span>
              <Input
                type="number"
                value={board.settings.makeCount}
                onChange={(e) => patchSettings({ makeCount: Math.max(1, Math.round(Number(e.target.value))) || 1 })}
                step={1}
                min={1}
                className="h-8 w-20 border border-border bg-white text-center"
              />
            </div>

            {/* Price per bf */}
            {summary.buyList.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">$/bf</div>
                <div className="space-y-2">
                  {summary.buyList.map((b) => (
                    <div key={b.woodId} className="flex items-center justify-between">
                      <span className="text-sm">{getWood(b.woodId)?.name}</span>
                      <Input
                        type="number"
                        className="h-8 w-20 border border-border bg-white text-center"
                        placeholder="0"
                        value={board.settings.pricePerBf[b.woodId] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          const next = { ...board.settings.pricePerBf }
                          if (v === '') delete next[b.woodId]
                          else next[b.woodId] = Number(v)
                          patchSettings({ pricePerBf: next })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={board.settings.flipAlternate}
                  onCheckedChange={(v) => patchSettings({ flipAlternate: v === true })}
                />
                Flip alternate slices
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={board.settings.rotateAlternate}
                  onCheckedChange={(v) => patchSettings({ rotateAlternate: v === true })}
                />
                Rotate alternate slices
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Extras Section */}
        <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Extras
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${extrasOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pb-4">
            {(
              [
                ['feet', 'Rubber feet'],
                ['chamfer', 'Chamfer edges'],
                ['handles', 'Handles'],
                ['juiceGroove', 'Juice groove'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={board.settings.extras[key]}
                  onCheckedChange={(v) =>
                    patchSettings({
                      extras: { ...board.settings.extras, [key]: v === true },
                    })
                  }
                />
                {label}
              </label>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ScrollArea>
  )
}
