import { woodPreviewColor } from '../../domain/woods';
import { formatInches } from '../../domain/cutList';
import { parallelogramPoints, polyBounds } from '../../domain/polyShape';
import { rowIndexFromStripId, type KerfCut } from '../../domain/buildStages';
import type { BoardGeometry, RectPoly } from '../../domain/types';

type Props = {
  geometry: BoardGeometry;
  face: 'finished' | 'glue1';
  sliceGap?: number;
  kerfCuts?: KerfCut[];
  oiled?: boolean;
  showDimensions: boolean;
  selectedStripId: string | null;
  onSelect: (id: string | null) => void;
};

function spacedPolys(polys: RectPoly[], sliceGap: number): RectPoly[] {
  if (sliceGap <= 0) return polys;
  return polys.map((p) => ({
    ...p,
    y: p.y + rowIndexFromStripId(p.stripId) * sliceGap,
  }));
}

export function Preview2D({
  geometry,
  face,
  sliceGap = 0,
  kerfCuts = [],
  oiled = false,
  showDimensions,
  selectedStripId,
  onSelect,
}: Props) {
  const raw = face === 'finished' ? geometry.finished : geometry.glueUp1;
  const polys = spacedPolys(raw, sliceGap);
  const bounds = polyBounds(polys);
  const maxX = Math.max(bounds.maxX, 1);
  const maxY = Math.max(bounds.maxY, ...kerfCuts.map((c) => c.y + c.h), 1);
  const spanX = Math.max(maxX - bounds.minX, 1);
  const spanY = Math.max(maxY - bounds.minY, 1);
  const pad = 40;
  const w = 400;
  const h = 320;
  const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full bg-paper" role="img" aria-label="Board preview 2D">
      <rect x={0} y={0} width={w} height={h} fill="var(--paper)" />
      <g transform={`translate(${pad - bounds.minX * scale}, ${pad - bounds.minY * scale})`}>
        {polys.map((p) => {
          const selected = selectedStripId != null && p.stripId.startsWith(selectedStripId);
          const pts = parallelogramPoints(p)
            .map(([x, y]) => `${x * scale},${y * scale}`)
            .join(' ');
          return (
            <polygon
              key={p.stripId}
              points={pts}
              fill={woodPreviewColor(p.woodId, oiled)}
              stroke={selected ? 'var(--accent)' : 'var(--line)'}
              strokeWidth={selected ? 2 : 0.5}
              className="cursor-pointer"
              onClick={() => onSelect(p.stripId.split('-r')[0] ?? p.stripId)}
            />
          );
        })}
        {kerfCuts.map((c, i) => (
          <rect
            key={`kerf-${i}`}
            x={bounds.minX * scale - 2}
            y={c.y * scale}
            width={spanX * scale + 4}
            height={Math.max(2, c.h * scale)}
            fill="#1c1917"
          />
        ))}
        {showDimensions && (
          <>
            <text x={bounds.minX * scale} y={bounds.minY * scale - 12} className="tabular fill-ink text-[11px]">
              {formatInches(geometry.overall.width)} wide
            </text>
            <text
              x={maxX * scale + 8}
              y={(bounds.minY + maxY) * scale / 2}
              className="tabular fill-ink text-[11px]"
            >
              {formatInches(geometry.overall.length)}
            </text>
            <text x={bounds.minX * scale} y={maxY * scale + 18} className="tabular fill-muted text-[11px]">
              {formatInches(geometry.overall.thickness)} thick
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
