import { useBoardStore, useDerived } from '../../state/boardStore'
import { getWood } from '../../domain/woods'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

export function ShopTicket() {
  const board = useBoardStore((s) => s.board)
  const patchSettings = useBoardStore((s) => s.patchSettings)
  const advanced = useBoardStore((s) => s.advanced)
  const setAdvanced = useBoardStore((s) => s.setAdvanced)
  const { summary, invCompare } = useDerived()
  const [extrasOpen, setExtrasOpen] = useState(false)

  const openSections = [
    ...(advanced ? ['advanced'] : []),
    ...(extrasOpen ? ['extras'] : []),
  ]

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Stock</div>
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

        {board.grainMode === 'end' && (
          <div className="flex text-sm">
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

        {summary.warnings.length > 0 && (
          <div className="flex flex-col gap-2">
            {summary.warnings.map((w) => (
              <div
                key={w.id}
                className={`rounded-md border p-3 text-sm ${
                  w.level === 'warn'
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                {w.message}
              </div>
            ))}
          </div>
        )}

        {invCompare.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-muted-foreground">Inventory</div>
            <div className="flex flex-col gap-1">
              {invCompare.map((c) => (
                <div key={c.woodId} className="flex items-center justify-between text-sm">
                  <span className={c.enough ? 'text-success' : 'text-warning'}>
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

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(v) => {
            setAdvanced(v.includes('advanced'))
            setExtrasOpen(v.includes('extras'))
          }}
          className="flex flex-col gap-2"
        >
          <AccordionItem value="advanced" className="rounded-lg border border-border">
            <AccordionTrigger className="px-3 text-sm font-medium">Advanced</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 px-3 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Kerf</span>
                  <Input
                    type="number"
                    value={board.settings.kerf}
                    onChange={(e) => patchSettings({ kerf: Number(e.target.value) || 0.125 })}
                    step={0.03125}
                    className="h-8 w-20 text-center"
                  />
                </div>
                <PresetToggle
                  value={board.settings.kerf}
                  presets={[
                    [0.0625, '1/16'],
                    [0.09375, '3/32'],
                    [0.125, '1/8'],
                  ]}
                  onSelect={(n) => patchSettings({ kerf: n })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Flatten</span>
                  <Input
                    type="number"
                    value={board.settings.flattenAllowance}
                    onChange={(e) =>
                      patchSettings({ flattenAllowance: Number(e.target.value) || 0 })
                    }
                    step={0.0625}
                    className="h-8 w-20 text-center"
                  />
                </div>
                <PresetToggle
                  value={board.settings.flattenAllowance}
                  presets={[
                    [0.0625, '1/16'],
                    [0.125, '1/8'],
                    [0.25, '1/4'],
                  ]}
                  onSelect={(n) => patchSettings({ flattenAllowance: n })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Panel thickness</span>
                  <Input
                    type="number"
                    value={board.settings.panelThickness}
                    onChange={(e) =>
                      patchSettings({ panelThickness: Number(e.target.value) || 1 })
                    }
                    step={0.125}
                    className="h-8 w-20 text-center"
                  />
                </div>
                <PresetToggle
                  value={board.settings.panelThickness}
                  presets={[
                    [0.75, '0.75'],
                    [1, '1'],
                    [1.25, '1.25'],
                    [1.5, '1.5'],
                  ]}
                  onSelect={(n) => patchSettings({ panelThickness: n })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">Extra length</span>
                <Input
                  type="number"
                  value={board.settings.extraLength}
                  onChange={(e) => patchSettings({ extraLength: Number(e.target.value) || 0 })}
                  step={0.5}
                  className="h-8 w-20 text-center"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">Planer width</span>
                <Input
                  type="number"
                  value={board.settings.planerWidth}
                  onChange={(e) => patchSettings({ planerWidth: Number(e.target.value) || 13 })}
                  step={1}
                  className="h-8 w-20 text-center"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">Quantity</span>
                <Input
                  type="number"
                  value={board.settings.makeCount}
                  onChange={(e) =>
                    patchSettings({
                      makeCount: Math.max(1, Math.round(Number(e.target.value))) || 1,
                    })
                  }
                  step={1}
                  min={1}
                  className="h-8 w-20 text-center"
                />
              </div>

              {summary.buyList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-muted-foreground">$/bf</div>
                  <div className="flex flex-col gap-2">
                    {summary.buyList.map((b) => (
                      <div key={b.woodId} className="flex items-center justify-between gap-3">
                        <span className="text-sm">{getWood(b.woodId)?.name}</span>
                        <Input
                          type="number"
                          className="h-8 w-20 text-center"
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

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={board.settings.flipAlternate}
                    onCheckedChange={(v) => patchSettings({ flipAlternate: v === true })}
                  />
                  Flip alternate slices
                </label>
                <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={board.settings.rotateAlternate}
                    onCheckedChange={(v) => patchSettings({ rotateAlternate: v === true })}
                  />
                  Rotate alternate slices
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="extras" className="rounded-lg border border-border">
            <AccordionTrigger className="px-3 text-sm font-medium">Extras</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 px-3 pb-4">
              {(
                [
                  ['feet', 'Rubber feet'],
                  ['chamfer', 'Chamfer edges'],
                  ['handles', 'Handles'],
                  ['juiceGroove', 'Juice groove'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  )
}

function PresetToggle({
  value,
  presets,
  onSelect,
}: {
  value: number
  presets: [number, string][]
  onSelect: (n: number) => void
}) {
  const active = presets.find(([p]) => Math.abs(value - p) < 0.001)?.[0]

  return (
    <ToggleGroup
      type="single"
      value={active !== undefined ? String(active) : ''}
      onValueChange={(v) => {
        if (v) onSelect(Number(v))
      }}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {presets.map(([p, label]) => (
        <ToggleGroupItem key={p} value={String(p)} className="flex-1 text-xs">
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
