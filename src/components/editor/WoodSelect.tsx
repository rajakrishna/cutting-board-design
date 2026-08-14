import { useState, useMemo } from 'react'
import { WOODS, getWood } from '../../domain/woods'
import type { Wood } from '../../domain/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronDown, Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (woodId: string) => void
  foodSafeOnly?: boolean
  allowedIds?: string[] | null
}

export function WoodSelect({ value, onChange, foodSafeOnly, allowedIds }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const baseList = useMemo(() => {
    let list: Wood[] = WOODS
    if (foodSafeOnly) list = list.filter((w) => w.foodSafe)
    if (allowedIds && allowedIds.length) list = list.filter((w) => allowedIds.includes(w.id))
    return list
  }, [foodSafeOnly, allowedIds])

  const filteredList = useMemo(() => {
    if (!search.trim()) return baseList
    const q = search.toLowerCase()
    return baseList.filter(
      (w) => w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)
    )
  }, [baseList, search])

  const groups = ['domestic', 'exotic', 'accent', 'custom'] as const
  const selected = getWood(value)

  const handleSelect = (woodId: string) => {
    onChange(woodId)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 w-[110px] justify-between gap-1 px-1.5 text-xs font-normal"
        >
          <span className="flex items-center gap-1.5 truncate">
            {selected && (
              <span
                className="inline-block size-3 shrink-0 rounded-sm border border-border"
                style={{ background: selected.color }}
              />
            )}
            <span className="truncate">{selected?.name ?? 'Select wood'}</span>
          </span>
          <ChevronDown className="size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 border-b px-2 py-1.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search wood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 border-0 p-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-[240px]">
          <div className="p-1">
            {groups.map((g) => {
              const items = filteredList.filter((w) => w.group === g)
              if (!items.length) return null
              return (
                <div key={g} className="mb-1">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {g}
                  </div>
                  {items.map((w) => {
                    const isSelected = w.id === value
                    const caution = w.openPore || w.oily || w.id === 'soft-maple'
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleSelect(w.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs outline-none',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:bg-accent focus-visible:text-accent-foreground',
                          isSelected && 'bg-primary/10 font-medium'
                        )}
                      >
                        <span
                          className="inline-block size-3.5 shrink-0 rounded-sm border border-border"
                          style={{ background: w.color }}
                        />
                        <span className="flex-1 truncate">{w.name}</span>
                        {caution && <span className="text-destructive">!</span>}
                      </button>
                    )
                  })}
                </div>
              )
            })}
            {filteredList.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                No woods found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
