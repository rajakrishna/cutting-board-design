import type { MouseEvent } from 'react'
import { PRESETS } from '../../data/templates'
import { buildFinishedPolygons } from '../../domain/geometry'
import { getWood } from '../../domain/woods'
import type { Board, Preset } from '../../domain/types'
import { useBoardStore } from '../../state/boardStore'

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
  const maxX = Math.max(...polys.map((p) => p.x + p.w), 1)
  const maxY = Math.max(...polys.map((p) => p.y + p.h), 1)
  return (
    <svg
      viewBox={`0 0 ${maxX} ${maxY}`}
      className="h-10 w-full rounded-md border border-border"
      preserveAspectRatio="none"
      aria-hidden
    >
      {polys.map((p) => (
        <rect
          key={p.stripId}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          fill={getWood(p.woodId)?.color ?? '#94a3b8'}
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
      <h2 className="text-sm font-medium">Presets</h2>
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
            <span className="relative mt-2 block truncate text-xs font-medium">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
