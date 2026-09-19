import type { MouseEvent } from 'react'
import { PRESETS } from '../../data/templates'
import { buildFinishedPolygons } from '../../domain/geometry'
import { parallelogramPoints, polyBounds } from '../../domain/polyShape'
import { woodPreviewColor } from '../../domain/woods'
import type { Board, Preset } from '../../domain/types'
import { useBoardStore } from '../../state/boardStore'

const APPROXIMATE = new Set([
  'cube-illusion',
  'tumbling-block',
  'four-towers',
  'chevron',
])

function presetThumbBoard(preset: Preset): Board {
  return {
    id: 'thumb',
    name: preset.name,
    ...preset.board,
    settings: {
      ...preset.board.settings,
      finishedLength: Math.min(8, preset.board.settings.finishedLength),
    },
  }
}

function FinishedThumb({ preset }: { preset: Preset }) {
  const polys = buildFinishedPolygons(presetThumbBoard(preset))
  const b = polyBounds(polys)
  const w = Math.max(b.maxX - b.minX, 1)
  const h = Math.max(b.maxY - b.minY, 1)
  return (
    <svg
      viewBox={`${b.minX} ${b.minY} ${w} ${h}`}
      className="h-10 w-full rounded-md border border-border"
      preserveAspectRatio="none"
      aria-hidden
    >
      {polys.map((p) => (
        <polygon
          key={p.stripId}
          points={parallelogramPoints(p)
            .map(([x, y]) => `${x},${y}`)
            .join(' ')}
          fill={woodPreviewColor(p.woodId, true)}
        />
      ))}
    </svg>
  )
}

export function PresetGallery() {
  const loadPreset = useBoardStore((s) => s.loadPreset)

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-sm font-medium">Showpieces</h2>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Click a named pattern to load it.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => loadPreset(p.id)}
            onMouseMove={handleMove}
            className="group relative overflow-hidden rounded-lg border border-border bg-input p-2 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(110px circle at var(--x) var(--y), color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%)',
              }}
            />
            <span className="relative">
              <FinishedThumb preset={p} />
            </span>
            <span className="relative mt-1.5 flex items-center gap-1">
              <span className="truncate text-xs font-medium">{p.name}</span>
              {APPROXIMATE.has(p.id) && (
                <span className="shrink-0 rounded bg-muted px-1 py-px text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  approx
                </span>
              )}
            </span>
            <span className="relative mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
              {p.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
