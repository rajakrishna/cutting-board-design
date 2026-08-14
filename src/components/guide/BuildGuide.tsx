import { useBoardStore, useDerived } from '../../state/boardStore'
import { CARE_CARD } from '../../domain/guide'
import { getWood } from '../../domain/woods'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Info, Printer } from 'lucide-react'

function BoardMiniPreview() {
  const board = useBoardStore((s) => s.board)
  const totalWidth = board.strips.reduce((a, s) => a + s.width, 0)

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        Board Preview
      </div>
      <div className="flex h-12 w-full overflow-hidden rounded-md border border-border">
        {board.strips.map((s, i) => {
          const wood = getWood(s.woodId)
          const widthPercent = (s.width / totalWidth) * 100
          return (
            <div
              key={`mini-${s.id}-${i}`}
              className="h-full"
              style={{
                background: wood?.color ?? '#ccc',
                width: `${widthPercent}%`,
              }}
              title={`${wood?.name}: ${s.width}"`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{board.strips.length} strips</span>
        <span>
          {board.settings.finishedLength}" × {board.settings.finishedWidth}" × {board.settings.finishedThickness}"
        </span>
      </div>
    </div>
  )
}

export function BuildGuide() {
  const appView = useBoardStore((s) => s.appView)
  const guideStep = useBoardStore((s) => s.guideStep)
  const setGuideStep = useBoardStore((s) => s.setGuideStep)
  const setAppView = useBoardStore((s) => s.setAppView)
  const { guide, summary } = useDerived()
  const step = guide[Math.min(guideStep, guide.length - 1)]
  const open = appView === 'guide'

  if (!step) return null

  return (
    <Sheet open={open} onOpenChange={(v) => setAppView(v ? 'guide' : 'design')}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Build Guide</SheetTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print sheet
            </Button>
          </div>
        </SheetHeader>

        <div className="border-b border-border px-3 py-2">
          <ToggleGroup
            type="single"
            value={String(guideStep)}
            onValueChange={(v) => {
              if (v != null && v !== '') setGuideStep(Number(v))
            }}
            variant="outline"
            size="sm"
            className="flex w-full flex-wrap justify-start gap-1"
          >
            {guide.map((s, i) => (
              <ToggleGroupItem
                key={s.id}
                value={String(i)}
                className="rounded-md px-2 text-xs data-[spacing=0]:rounded-md data-[spacing=0]:border-l"
              >
                {i + 1}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            {/* Board preview at top for steps 2+ */}
            {guideStep > 0 && <BoardMiniPreview />}

            <div>
              <div className="text-xs text-muted-foreground">
                Step {guideStep + 1} of {guide.length}
              </div>
              <h2 className="mt-1 text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{step.caption}</p>
            </div>

            {/* Compact measurements - inline for step 1 */}
            {step.measurements && (
              step.id === 'overview' ? (
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  {Object.entries(step.measurements).map(([k, v]) => (
                    <span key={k} className="text-sm">
                      <span className="text-muted-foreground">
                        {k === 'stopBlock' ? 'Stop: ' : k === 'slices' ? 'Slices: ' : k === 'clamps' ? 'Clamps: ' : `${k}: `}
                      </span>
                      <span className={`tabular-nums font-semibold ${k === 'stopBlock' ? 'text-lg text-primary' : ''}`}>
                        {String(v)}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <Card className="shadow-none">
                  <CardContent className="grid grid-cols-2 gap-3 p-4">
                    {Object.entries(step.measurements).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[10px] uppercase text-muted-foreground">
                          {k === 'stopBlock' ? 'Stop block' : k === 'stripLength' ? 'Strip length' : k}
                        </div>
                        <div
                          className={`tabular-nums font-semibold ${
                            k === 'stopBlock' ? 'text-2xl' : 'text-lg'
                          }`}
                        >
                          {String(v)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            )}

            {/* Compact tools - inline checkboxes */}
            {step.tools.length > 0 && (
              <div className="rounded-md border border-border p-3">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tools this step
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {step.tools.map((t) => {
                    const hasDetails = t.or || t.never
                    return (
                      <span key={t.need} className="inline-flex items-center gap-1.5">
                        <Checkbox checked disabled className="pointer-events-none size-3.5" />
                        <span className="text-sm">{t.need}</span>
                        {hasDetails && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="h-4 w-4 text-muted-foreground"
                              >
                                <Info className="size-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px]">
                              {t.or && (
                                <p className="text-xs">
                                  <span className="font-medium">Alternative:</span> {t.or}
                                </p>
                              )}
                              {t.never && (
                                <p className="mt-1 text-xs text-destructive">
                                  <span className="font-medium">Never:</span> {t.never}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {step.id === 'overview' && (
              <div className="text-sm">
                <span className="font-medium">Woods: </span>
                <span className="text-muted-foreground">
                  {summary.buyList.map((b) => b.label).join(', ')}
                </span>
              </div>
            )}

            {step.id === 'finish' && (
              <div>
                <h3 className="text-sm font-medium">Care card</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {CARE_CARD.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Board preview at bottom only for step 1 */}
            {guideStep === 0 && <BoardMiniPreview />}
          </div>
        </ScrollArea>

        <Separator />
        <SheetFooter className="flex-row gap-2 border-t-0 p-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={guideStep <= 0}
            onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
          >
            Back
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={guideStep >= guide.length - 1}
            onClick={() => setGuideStep(Math.min(guide.length - 1, guideStep + 1))}
          >
            Next
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
