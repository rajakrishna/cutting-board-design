import { useBoardStore } from '../../state/boardStore'
import { PRESETS } from '../../data/templates'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy, Dice5, Download, FolderOpen, Printer, Save, Share2, Undo2 } from 'lucide-react'

export function ShareBar() {
  const shareUrl = useBoardStore((s) => s.shareUrl)
  const exportJson = useBoardStore((s) => s.exportJson)
  const importJson = useBoardStore((s) => s.importJson)
  const saveCurrent = useBoardStore((s) => s.saveCurrent)
  const duplicateBoard = useBoardStore((s) => s.duplicateBoard)
  const newBoard = useBoardStore((s) => s.newBoard)
  const randomize = useBoardStore((s) => s.randomize)
  const undo = useBoardStore((s) => s.undo)
  const undoBoard = useBoardStore((s) => s.undoBoard)
  const loadPreset = useBoardStore((s) => s.loadPreset)
  const savedBoards = useBoardStore((s) => s.savedBoards)
  const loadSaved = useBoardStore((s) => s.loadSaved)

  return (
    <div className="no-print flex flex-wrap items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="sm" onClick={newBoard}>
            New
          </Button>
        </TooltipTrigger>
        <TooltipContent>Start blank board</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" size="sm" onClick={() => randomize()}>
            <Dice5 className="size-3.5" />
            Random
          </Button>
        </TooltipTrigger>
        <TooltipContent>Randomize strips</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon-sm" onClick={undo} disabled={!undoBoard}>
            <Undo2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Button type="button" variant="outline" size="sm" onClick={duplicateBoard}>
        <Copy className="size-3.5" />
        Dup
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={saveCurrent}>
        <Save className="size-3.5" />
        Save
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          const url = shareUrl()
          await navigator.clipboard.writeText(url)
          alert('Share URL copied')
        }}
      >
        <Share2 className="size-3.5" />
        Share
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const blob = new Blob([exportJson()], { type: 'application/json' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = 'board.json'
          a.click()
        }}
      >
        <Download className="size-3.5" />
        JSON
      </Button>
      <Button type="button" variant="outline" size="sm" asChild>
        <label className="cursor-pointer">
          <FolderOpen className="size-3.5" />
          Import
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              if (!importJson(text)) alert('Invalid board JSON')
              e.target.value = ''
            }}
          />
        </label>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-3.5" />
        Print
      </Button>

      <Select
        onValueChange={(v) => {
          if (v) loadPreset(v)
        }}
      >
        <SelectTrigger size="sm" className="w-[130px]">
          <SelectValue placeholder="Presets…" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {savedBoards.length > 0 && (
        <Select
          onValueChange={(v) => {
            if (v) loadSaved(v)
          }}
        >
          <SelectTrigger size="sm" className="w-[130px]">
            <SelectValue placeholder="My boards…" />
          </SelectTrigger>
          <SelectContent>
            {savedBoards.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
