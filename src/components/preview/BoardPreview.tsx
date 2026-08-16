import { useRef, useState, useCallback } from 'react'
import { Preview2D } from './Preview2D'
import { Preview3D, DEFAULT_ZOOM, type Preview3DRef } from './PreviewStage'
import { CanvasToolbar } from './CanvasToolbar'
import { useBoardStore, useDerived } from '../../state/boardStore'
import { formatInches } from '../../domain/cutList'
import { SIZE_CHIPS } from '../../domain/defaults'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export function BoardPreview() {
  const previewMode = useBoardStore((s) => s.previewMode)
  const faceMode = useBoardStore((s) => s.faceMode)
  const showDimensions = useBoardStore((s) => s.showDimensions)
  const selectedStripId = useBoardStore((s) => s.selectedStripId)
  const selectStrip = useBoardStore((s) => s.selectStrip)
  const setPreviewMode = useBoardStore((s) => s.setPreviewMode)
  const setFaceMode = useBoardStore((s) => s.setFaceMode)
  const setShowDimensions = useBoardStore((s) => s.setShowDimensions)
  const board = useBoardStore((s) => s.board)
  const patchSettings = useBoardStore((s) => s.patchSettings)
  const setGrainMode = useBoardStore((s) => s.setGrainMode)
  const applySize = useBoardStore((s) => s.applySize)
  const { geometry, summary } = useDerived()

  const sizeId = SIZE_CHIPS.find(
    (c) =>
      c.length === board.settings.finishedLength &&
      c.width === board.settings.finishedWidth &&
      c.thickness === board.settings.finishedThickness
  )?.id

  const preview3DRef = useRef<Preview3DRef>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.25, 4)
    setZoom(newZoom)
    preview3DRef.current?.setZoom(newZoom)
  }, [zoom])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.25, 0.25)
    setZoom(newZoom)
    preview3DRef.current?.setZoom(newZoom)
  }, [zoom])

  const handleFit = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    preview3DRef.current?.resetCamera()
  }, [])

  const handleZoomTo = useCallback((level: number) => {
    setZoom(level)
    preview3DRef.current?.setZoom(level)
  }, [])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top toolbar with all board controls */}
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
        {/* View mode */}
        <ToggleGroup
          type="single"
          value={previewMode}
          onValueChange={(v) => {
            if (v === '3d' || v === '2d') setPreviewMode(v)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="3d" className="text-xs font-medium uppercase">
            3D
          </ToggleGroupItem>
          <ToggleGroupItem value="2d" className="text-xs font-medium uppercase">
            2D
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Face mode */}
        <ToggleGroup
          type="single"
          value={faceMode}
          onValueChange={(v) => {
            if (v === 'finished' || v === 'glue1') setFaceMode(v)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="finished" className="text-xs">
            Done
          </ToggleGroupItem>
          <ToggleGroupItem value="glue1" className="text-xs">
            Glue
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Grain mode */}
        <ToggleGroup
          type="single"
          value={board.grainMode}
          onValueChange={(v) => {
            if (v === 'end' || v === 'long') setGrainMode(v)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="end" className="text-xs capitalize">
            end
          </ToggleGroupItem>
          <ToggleGroupItem value="long" className="text-xs capitalize">
            long
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-5" />

        {/* Size presets */}
        <Select
          value={sizeId}
          onValueChange={(v) => {
            const c = SIZE_CHIPS.find((x) => x.id === v)
            if (c) applySize(c.length, c.width, c.thickness)
          }}
        >
          <SelectTrigger size="sm" className="w-28 text-xs">
            <SelectValue placeholder="Sizes" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_CHIPS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dimensions */}
        <div className="flex items-center gap-2">
          <DimensionField
            label="L"
            value={board.settings.finishedLength}
            onChange={(n) => patchSettings({ finishedLength: n || 12 })}
          />
          <DimensionField
            label="W"
            value={board.settings.finishedWidth}
            onChange={(n) => patchSettings({ finishedWidth: n || 8 })}
          />
          <DimensionField
            label="T"
            value={board.settings.finishedThickness}
            onChange={(n) => patchSettings({ finishedThickness: n || 1.5 })}
            step={0.25}
          />
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Stop block result */}
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-accent px-2 py-1">
          <span className="text-xs text-accent-foreground/80">
            {board.grainMode === 'end' ? 'Stop' : 'Thk'}
          </span>
          <span className="text-sm font-semibold tabular-nums text-accent-foreground">
            {formatInches(summary.stopBlock)}
          </span>
        </div>

        {board.grainMode === 'end' && (
          <span className="text-xs text-muted-foreground">
            {summary.sliceCount} slices · {formatInches(summary.leftover)} left
          </span>
        )}

        {/* Show dimensions toggle - pushed right */}
        <label className="ml-auto flex min-h-8 cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={showDimensions}
            onCheckedChange={(v) => setShowDimensions(v === true)}
          />
          Dims
        </label>
      </div>
      <div className="relative min-h-0 flex-1 bg-preview-canvas">
        {previewMode === '3d' ? (
          <>
            <Preview3D
              ref={preview3DRef}
              geometry={geometry}
              face={faceMode}
              showDimensions={showDimensions}
              selectedStripId={selectedStripId}
              onSelect={selectStrip}
              thickness={board.settings.finishedThickness}
              onZoomChange={handleZoomChange}
            />
            <CanvasToolbar
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFit={handleFit}
              onZoomTo={handleZoomTo}
            />
          </>
        ) : (
          <Preview2D
            geometry={geometry}
            face={faceMode}
            showDimensions={showDimensions}
            selectedStripId={selectedStripId}
            onSelect={selectStrip}
          />
        )}
      </div>
    </div>
  )
}

function DimensionField({
  label,
  value,
  onChange,
  step,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  step?: number
}) {
  return (
    <InputGroup className="h-8 w-24">
      <InputGroupAddon align="inline-start" className="px-1.5 text-xs text-muted-foreground">
        {label}
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 px-0 text-center text-xs tabular-nums"
      />
      <InputGroupAddon align="inline-end" className="px-1.5 text-xs text-muted-foreground">
        &quot;
      </InputGroupAddon>
    </InputGroup>
  )
}
