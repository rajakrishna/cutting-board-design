import { useEffect, useState } from 'react'
import { useBoardStore } from '../../state/boardStore'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function BoardTitle() {
  const name = useBoardStore((s) => s.board.name)
  const setBoardName = useBoardStore((s) => s.setBoardName)
  const [draft, setDraft] = useState(name)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setDraft(name)
  }, [name])

  const commit = () => {
    const next = draft.trim()
    if (!next) {
      setDraft(name)
      return
    }
    setBoardName(next)
  }

  return (
    <div className="relative w-[9.5rem] shrink-0 sm:w-[14rem]">
      <Input
        value={draft}
        title={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          commit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(name)
            e.currentTarget.blur()
          }
        }}
        aria-label="Board name"
        className={cn(
          'h-8 truncate border-transparent bg-transparent px-1.5 text-sm font-semibold tracking-tight shadow-none transition-[width,background-color,box-shadow] hover:bg-muted md:text-sm',
          focused
            ? 'absolute inset-y-0 left-0 z-30 w-[min(22rem,calc(100vw-5rem))] max-w-[min(22rem,calc(100vw-5rem))] border-input-border bg-input shadow-xs'
            : 'w-full',
        )}
      />
    </div>
  )
}
