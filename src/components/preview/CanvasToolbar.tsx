import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
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
    <div className="absolute bottom-2 right-2 z-10">
      <ButtonGroup className="bg-card/95 shadow-sm backdrop-blur-sm">
        <Button variant="outline" size="icon-sm" onClick={onZoomOut} title="Zoom out">
          <Minus className="size-3.5" />
          <span className="sr-only">Zoom out</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-13 tabular-nums">
              {displayZoom}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-18">
            {ZOOM_LEVELS.map((level) => (
              <DropdownMenuItem
                key={level}
                onSelect={() => onZoomTo(level / 100)}
                className="justify-center text-xs tabular-nums"
              >
                {level}%
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={onFit} className="justify-center text-xs">
              Fit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon-sm" onClick={onZoomIn} title="Zoom in">
          <Plus className="size-3.5" />
          <span className="sr-only">Zoom in</span>
        </Button>
        <Button variant="outline" size="icon-sm" onClick={onFit} title="Fit to screen">
          <Maximize2 className="size-3.5" />
          <span className="sr-only">Fit to screen</span>
        </Button>
      </ButtonGroup>
    </div>
  )
}
