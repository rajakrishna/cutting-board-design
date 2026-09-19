import { useEffect, useState } from 'react'
import { useBoardStore } from '../../state/boardStore'
import { Input } from '@/components/ui/input'

export function BoardTitle() {
  const name = useBoardStore((s) => s.board.name)
  const setBoardName = useBoardStore((s) => s.setBoardName)
  const [draft, setDraft] = useState(name)

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
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          setDraft(name)
          e.currentTarget.blur()
        }
      }}
      aria-label="Board name"
      className="h-8 min-w-0 max-w-[9.5rem] border-transparent bg-transparent px-1.5 text-sm font-semibold tracking-tight shadow-none hover:bg-muted sm:max-w-[14rem] md:text-sm"
    />
  )
}
