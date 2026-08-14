import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Minus, Plus, Maximize2 } from 'lucide-react'

type Props = {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  onZoomTo: (level: number) => void
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200]

export function CanvasToolbar({ zoom, onZoomIn, onZoomOut, onFit, onZoomTo }: Props) {
  const displayZoom = Math.round(zoom * 100)

  return (
    <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 rounded border border-border bg-card/95 p-0.5 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom out"
        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Minus className="size-3" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-6 min-w-[44px] items-center justify-center rounded px-1.5 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {displayZoom}%
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[72px]">
          {ZOOM_LEVELS.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => onZoomTo(level / 100)}
              className="justify-center text-xs tabular-nums"
            >
              {level}%
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={onFit} className="justify-center text-xs">
            Fit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom in"
        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Plus className="size-3" />
      </button>

      <span className="mx-0.5 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={onFit}
        title="Fit to screen"
        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Maximize2 className="size-3" />
      </button>
    </div>
  )
}
