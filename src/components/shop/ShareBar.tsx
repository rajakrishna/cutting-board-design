import { useRef, useState } from 'react'
import { useBoardStore } from '../../state/boardStore'
import { PRESETS } from '../../data/templates'
import { notify } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Check,
  Copy,
  Dice5,
  Download,
  FilePlus2,
  MoreVertical,
  Printer,
  Save,
  Share2,
  Undo2,
  Upload,
} from 'lucide-react'

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

  const [shared, setShared] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleShare = async () => {
    await navigator.clipboard.writeText(shareUrl())
    setShared(true)
    notify.success('Share link copied to clipboard')
    setTimeout(() => setShared(false), 1500)
  }

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'board.json'
    a.click()
    notify.success('Board exported')
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    if (importJson(text)) notify.success('Board imported')
    else notify.error('Invalid board JSON')
    e.target.value = ''
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm" onClick={newBoard}>
              <FilePlus2 className="size-3.5" />
              <span className="sr-only">New</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start blank board</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={undo}
              disabled={!undoBoard}
            >
              <Undo2 className="size-3.5" />
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" size="sm" variant="outline" onClick={() => randomize()}>
            <Dice5 className="size-3.5" />
            Random
          </Button>
        </TooltipTrigger>
        <TooltipContent>Randomize strips</TooltipContent>
      </Tooltip>

      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm" onClick={duplicateBoard}>
              <Copy className="size-3.5" />
              <span className="sr-only">Duplicate</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate board</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm" onClick={saveCurrent}>
              <Save className="size-3.5" />
              <span className="sr-only">Save</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save board</TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <Button type="button" size="sm" onClick={handleShare}>
        {shared ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        {shared ? 'Copied' : 'Share'}
      </Button>

      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              <span className="sr-only">Print</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon-sm">
                  <MoreVertical className="size-3.5" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={handleExport}>
              <Download />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
              <Upload />
              Import JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      <Select
        onValueChange={(v) => {
          if (v) loadPreset(v)
        }}
      >
        <SelectTrigger size="sm" className="w-32.5">
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
          <SelectTrigger size="sm" className="w-32.5">
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
