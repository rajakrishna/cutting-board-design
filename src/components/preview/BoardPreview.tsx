import { useRef, useState, useCallback } from 'react'
import { Preview2D } from './Preview2D'
import { Preview3D, type Preview3DRef } from './PreviewStage'
import { CanvasToolbar } from './CanvasToolbar'
import { useBoardStore, useDerived } from '../../state/boardStore'
import { formatInches } from '../../domain/cutList'
import { SIZE_CHIPS } from '../../domain/defaults'
import { Checkbox } from '@/components/ui/checkbox'

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
  const [zoom, setZoom] = useState(1)

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
    setZoom(1)
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
      <div className="no-print flex items-center gap-2 border-b border-border bg-card px-3 py-2">
        {/* View mode */}
        <div className="flex rounded border border-border">
          {(['3d', '2d'] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setPreviewMode(m)}
              className={`h-7 px-2.5 text-xs font-medium uppercase transition-colors ${
                previewMode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              } ${i === 0 ? 'rounded-l' : 'rounded-r'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Face mode */}
        <div className="flex rounded border border-border">
          {([['finished', 'Done'], ['glue1', 'Glue']] as const).map(([v, label], i) => (
            <button
              key={v}
              type="button"
              onClick={() => setFaceMode(v)}
              className={`h-7 px-2.5 text-xs transition-colors ${
                faceMode === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              } ${i === 0 ? 'rounded-l' : 'rounded-r'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grain mode */}
        <div className="flex rounded border border-border">
          {(['end', 'long'] as const).map((v, i) => (
            <button
              key={v}
              type="button"
              onClick={() => setGrainMode(v)}
              className={`h-7 px-2.5 text-xs capitalize transition-colors ${
                board.grainMode === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              } ${i === 0 ? 'rounded-l' : 'rounded-r'}`}
            >
              {v}
            </button>
          ))}
        </div>

        <span className="h-5 w-px bg-border" />

        {/* Size presets */}
        <div className="flex rounded border border-border">
          {SIZE_CHIPS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applySize(c.length, c.width, c.thickness)}
              className={`h-7 px-2 text-[11px] transition-colors ${
                sizeId === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              } ${i === 0 ? 'rounded-l' : ''} ${i === SIZE_CHIPS.length - 1 ? 'rounded-r' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Dimensions */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">L</span>
          <input
            type="number"
            value={board.settings.finishedLength}
            onChange={(e) => patchSettings({ finishedLength: Number(e.target.value) || 12 })}
            className="h-7 w-12 rounded border border-border bg-white text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">W</span>
          <input
            type="number"
            value={board.settings.finishedWidth}
            onChange={(e) => patchSettings({ finishedWidth: Number(e.target.value) || 8 })}
            className="h-7 w-12 rounded border border-border bg-white text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">T</span>
          <input
            type="number"
            value={board.settings.finishedThickness}
            onChange={(e) => patchSettings({ finishedThickness: Number(e.target.value) || 1.5 })}
            className="h-7 w-11 rounded border border-border bg-white text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            step={0.25}
          />
        </div>

        <span className="h-5 w-px bg-border" />

        {/* Stop block result */}
        <div className="flex items-center gap-1.5 rounded bg-primary/10 px-2 py-1">
          <span className="text-xs text-muted-foreground">
            {board.grainMode === 'end' ? 'Stop' : 'Thk'}
          </span>
          <span className="text-sm font-semibold tabular-nums text-primary">
            {formatInches(summary.stopBlock)}
          </span>
        </div>

        {board.grainMode === 'end' && (
          <span className="text-xs text-muted-foreground">
            {summary.sliceCount} slices · {formatInches(summary.leftover)} left
          </span>
        )}

        {/* Show dimensions toggle - pushed right */}
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <Checkbox
            checked={showDimensions}
            onCheckedChange={(v) => setShowDimensions(v === true)}
            className="size-3.5"
          />
          Dims
        </label>
      </div>
      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,oklch(0.96_0.01_90),oklch(0.92_0.015_85))]">
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
