import { getWood } from '../../domain/woods';
import { formatInches } from '../../domain/cutList';
import { rowIndexFromStripId, type KerfCut } from '../../domain/buildStages';
import type { BoardGeometry, RectPoly } from '../../domain/types';

type Props = {
  geometry: BoardGeometry;
  face: 'finished' | 'glue1';
  sliceGap?: number;
  kerfCuts?: KerfCut[];
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
  showDimensions,
  selectedStripId,
  onSelect,
}: Props) {
  const raw = face === 'finished' ? geometry.finished : geometry.glueUp1;
  const polys = spacedPolys(raw, sliceGap);
  const maxX = Math.max(...polys.map((p) => p.x + p.w), 1);
  const maxY = Math.max(
    ...polys.map((p) => p.y + p.h),
    ...kerfCuts.map((c) => c.y + c.h),
    1,
  );
  const pad = 40;
  const w = 400;
  const h = 320;
  const scale = Math.min((w - pad * 2) / maxX, (h - pad * 2) / maxY);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full bg-paper" role="img" aria-label="Board preview 2D">
      <rect x={0} y={0} width={w} height={h} fill="var(--paper)" />
      <g transform={`translate(${pad}, ${pad})`}>
        {polys.map((p) => {
          const wood = getWood(p.woodId);
          const selected = selectedStripId != null && p.stripId.startsWith(selectedStripId);
          return (
            <rect
              key={p.stripId}
              x={p.x * scale}
              y={p.y * scale}
              width={Math.max(1, p.w * scale)}
              height={Math.max(1, p.h * scale)}
              fill={wood?.color ?? '#ccc'}
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
            x={-2}
            y={c.y * scale}
            width={maxX * scale + 4}
            height={Math.max(2, c.h * scale)}
            fill="#1c1917"
          />
        ))}
        {showDimensions && (
          <>
            <text x={0} y={-12} className="tabular fill-ink text-[11px]">
              {formatInches(geometry.overall.width)} wide
            </text>
            <text
              x={maxX * scale + 8}
              y={maxY * scale / 2}
              className="tabular fill-ink text-[11px]"
            >
              {formatInches(geometry.overall.length)}
            </text>
            <text x={0} y={maxY * scale + 18} className="tabular fill-muted text-[11px]">
              {formatInches(geometry.overall.thickness)} thick
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
