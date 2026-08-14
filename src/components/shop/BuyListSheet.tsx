import { useBoardStore, useDerived } from '../../state/boardStore'
import { getWood } from '../../domain/woods'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Printer, X } from 'lucide-react'

export function BuyListSheet() {
  const buyListOpen = useBoardStore((s) => s.buyListOpen)
  const setBuyListOpen = useBoardStore((s) => s.setBuyListOpen)
  const board = useBoardStore((s) => s.board)
  const { summary, invCompare } = useDerived()

  const totalCost = summary.buyList.reduce((acc, b) => acc + (b.cost ?? 0), 0)
  const hasCosts = summary.buyList.some((b) => b.cost != null)

  return (
    <Sheet open={buyListOpen} onOpenChange={setBuyListOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <SheetTitle>Buy List</SheetTitle>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            {/* Summary header */}
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {board.name || 'Cutting Board'}
              </div>
              <div className="mt-1 text-sm">
                {summary.buyList.length} species · {summary.buyList.reduce((a, b) => a + parseFloat(b.boardFeet), 0).toFixed(1)} bf total
              </div>
              {hasCosts && totalCost > 0 && (
                <div className="mt-1 text-lg font-semibold">${totalCost.toFixed(2)}</div>
              )}
            </div>

            {/* Species cards */}
            <div className="flex flex-col gap-3">
              {summary.buyList.map((b) => {
                const wood = getWood(b.woodId)
                const inv = invCompare.find((c) => c.woodId === b.woodId)
                
                return (
                  <Card key={b.woodId} className="shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 size-5 shrink-0 rounded border border-border"
                          style={{ background: wood?.color ?? '#ccc' }}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{wood?.name ?? b.woodId}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{b.label}</div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="tabular-nums font-medium">{b.boardFeet} bf</span>
                            {b.cost != null && (
                              <span className="tabular-nums text-muted-foreground">${b.cost}</span>
                            )}
                          </div>
                          {inv && (
                            <div className={`mt-2 text-xs ${inv.enough ? 'text-ok' : 'text-warn'}`}>
                              {inv.enough ? '✓ In stock' : `! Need ${(inv.need - inv.have).toFixed(1)} bf more`}
                              {' '}({inv.have.toFixed(1)} / {inv.need.toFixed(1)} bf)
                            </div>
                          )}
                          {wood?.notes && (
                            <div className="mt-2 text-xs text-muted-foreground">{wood.notes}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Yard pick notes */}
            <div className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium">Yard pick notes</div>
              <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                <li>Check for straight grain and minimal defects</li>
                <li>Avoid boards with excessive twist or bow</li>
                <li>Look for consistent color within each species</li>
                {board.grainMode === 'end' && (
                  <li>Wider boards give better yield for end grain</li>
                )}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
