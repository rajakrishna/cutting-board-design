import { useRef, useState, useCallback, useEffect } from 'react'
import { Preview2D } from './Preview2D'
import { Preview3D, DEFAULT_ZOOM, type Preview3DRef } from './PreviewStage'
import { BuildStageBar } from './BuildStageBar'
import { CanvasToolbar } from './CanvasToolbar'
import { useBoardStore, useDerived } from '../../state/boardStore'
import {
  glueUpKerfCuts,
  glueUpSliceBands,
  stageShowsKerf,
  stageShowsSliceOutlines,
  stageSliceGap,
  stageUsesFinished,
} from '../../domain/buildStages'
import { formatInches } from '../../domain/cutList'
import { SIZE_CHIPS } from '../../domain/defaults'
import { Checkbox } from '@/components/ui/checkbox'
import { Toggle } from '@/components/ui/toggle'
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
  const buildStage = useBoardStore((s) => s.buildStage)
  const setBuildStage = useBoardStore((s) => s.setBuildStage)
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

  useEffect(() => {
    setZoom(DEFAULT_ZOOM)
  }, [board.grainMode, buildStage])

  const endGrain = board.grainMode === 'end'
  const stageFace = endGrain
    ? stageUsesFinished(buildStage)
      ? 'finished'
      : 'glue1'
    : faceMode
  const sliceGap = endGrain ? stageSliceGap(buildStage) : 0
  const kerfCuts = endGrain && stageShowsKerf(buildStage) ? glueUpKerfCuts(board) : []
  const sliceBands =
    endGrain && stageShowsSliceOutlines(buildStage) ? glueUpSliceBands(board) : []

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="no-print flex shrink-0 flex-col gap-1.5 border-b border-border bg-card px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
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

        {!endGrain && (
          <ToggleGroup
            type="single"
            value={stageFace}
            onValueChange={(v) => {
              if (v === 'finished' || v === 'glue1') setFaceMode(v)
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="finished" className="text-xs">
              Finished (edge)
            </ToggleGroupItem>
            <ToggleGroupItem value="glue1" className="text-xs">
              Glue-up
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        <ToggleGroup
          type="single"
          value={board.grainMode}
          onValueChange={(v) => {
            if (v === 'end' || v === 'long') setGrainMode(v)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="end" className="text-xs">
            End grain
          </ToggleGroupItem>
          <ToggleGroupItem value="long" className="text-xs">
            Edge grain
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-5" />

        {/* Size presets */}
        <Select
          value={sizeId ?? 'custom'}
          onValueChange={(v) => {
            const c = SIZE_CHIPS.find((x) => x.id === v)
            if (c) applySize(c.length, c.width, c.thickness)
          }}
        >
          <SelectTrigger size="sm" className="w-28 text-xs">
            <SelectValue placeholder={sizeId ? 'Sizes' : 'Custom'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" disabled>
              Custom
            </SelectItem>
            {SIZE_CHIPS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden items-center gap-2 md:flex">
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

        <Separator orientation="vertical" className="hidden h-5 md:block" />

        <div className="hidden items-center gap-1.5 rounded-md border border-border bg-accent px-2 py-1 md:flex">
          <span className="text-xs text-accent-foreground/80">
            {board.grainMode === 'end' ? 'Stop' : 'Thk'}
          </span>
          <span className="text-sm font-semibold tabular-nums text-accent-foreground">
            {formatInches(summary.stopBlock)}
          </span>
        </div>

        {board.grainMode === 'end' && (
          <span className="hidden text-xs text-muted-foreground md:inline">
            {summary.sliceCount} slices · {formatInches(summary.leftover)} left
          </span>
        )}

        <label className="ml-auto hidden min-h-8 cursor-pointer items-center gap-2 text-xs text-muted-foreground sm:flex">
          <Checkbox
            checked={showDimensions}
            onCheckedChange={(v) => setShowDimensions(v === true)}
          />
          Dims
        </label>
      </div>
      {endGrain && (
        <div className="min-w-0">
          <BuildStageBar stage={buildStage} onStage={setBuildStage} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Pattern
        </span>
        <Toggle
          variant="outline"
          size="sm"
          className="sm:h-10 sm:px-2.5"
          pressed={board.settings.flipAlternate}
          onPressedChange={(v) => patchSettings({ flipAlternate: v })}
          aria-label="Flip alternate slices"
        >
          Flip alternate
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          className="sm:h-10 sm:px-2.5"
          pressed={board.settings.rotateAlternate}
          onPressedChange={(v) => patchSettings({ rotateAlternate: v })}
          aria-label="Rotate alternate slices"
        >
          Rotate alternate
        </Toggle>
      </div>
      </div>
      <div className="relative min-h-[140px] flex-1 bg-preview-canvas">
        {previewMode === '3d' ? (
          <>
            <Preview3D
              ref={preview3DRef}
              geometry={geometry}
              face={stageFace}
              grainMode={board.grainMode}
              buildStage={endGrain ? buildStage : 'final'}
              sliceGap={sliceGap}
              kerfCuts={kerfCuts}
              sliceBands={sliceBands}
              oiled={endGrain && buildStage === 'final'}
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
            face={stageFace}
            sliceGap={sliceGap}
            kerfCuts={kerfCuts}
            sliceBands={sliceBands}
            oiled={endGrain && buildStage === 'final'}
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
