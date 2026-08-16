import { useDerived } from '../../state/boardStore'
import { Card } from '@/components/ui/card'

/** Thin wrapper used by shop ticket / print */
export function BuyList() {
  const { summary } = useDerived()
  return (
    <div className="flex flex-col gap-2">
      {summary.buyList.map((b) => (
        <Card
          key={b.woodId}
          className="flex-row items-center justify-between gap-2 px-3 py-2 shadow-none"
        >
          <span className="text-sm font-medium">{b.label}</span>
          <span className="text-sm tabular-nums text-muted-foreground">{b.boardFeet} bf</span>
        </Card>
      ))}
    </div>
  )
}
