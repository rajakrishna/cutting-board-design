import { useBoardStore, useDerived } from '../../state/boardStore';
import { formatInches } from '../../domain/cutList';
import { getWood } from '../../domain/woods';
import { CARE_CARD } from '../../domain/guide';
import { PRESETS } from '../../data/templates';

export function PrintShopSheet() {
  const board = useBoardStore((s) => s.board);
  const { summary, guide } = useDerived();
  const preset = PRESETS.find((p) => p.name === board.name);
  const totalWidth = board.strips.reduce((a, s) => a + s.width, 0);

  return (
    <div className="print-only p-6 text-foreground" aria-hidden="true">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{board.name}</h1>
          <p className="tabular text-sm text-muted">
            {formatInches(board.settings.finishedLength)} × {formatInches(board.settings.finishedWidth)} ×{' '}
            {formatInches(board.settings.finishedThickness)} · {board.grainMode === 'end' ? 'End grain' : 'Long grain'}
          </p>

          <div className="mt-4">
            <div className="text-xs uppercase text-muted">Stop block</div>
            <div className="tabular text-4xl font-bold">{formatInches(summary.stopBlock)}</div>
          </div>
        </div>
        
        {/* Board visual preview */}
        <div className="w-48 shrink-0">
          <div className="text-xs uppercase text-muted">Board preview</div>
          <div className="mt-1 flex h-16 w-full overflow-hidden border border-gray-300">
            {board.strips.map((s, i) => {
              const wood = getWood(s.woodId);
              const widthPercent = (s.width / totalWidth) * 100;
              return (
                <div
                  key={`print-strip-${s.id}-${i}`}
                  style={{
                    background: wood?.color ?? '#ccc',
                    width: `${widthPercent}%`,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1 text-[10px] text-muted">{board.strips.length} strips</div>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-medium">Buy list</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {summary.buyList.map((b) => (
          <li key={b.woodId}>
            {b.label} ({b.boardFeet} bf)
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-muted">
        Yard pick: kiln-dried, skip pith, skip loose knots on glue faces, FAS/Select if you can.
      </p>

      <h2 className="mt-6 text-lg font-medium">Cut list</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {board.strips.map((s, i) => (
          <li key={s.id}>
            Strip {i + 1}: {getWood(s.woodId)?.name} · {formatInches(s.width)}
          </li>
        ))}
      </ul>
      {preset && (
        <p className="mt-2 text-sm">
          Cut card: {preset.cutCard.notes}
        </p>
      )}

      <h2 className="mt-6 text-lg font-medium">Kit</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {guide[0]?.tools.map((t) => (
          <li key={t.need}>
            {t.need}
            {t.or ? ` (or ${t.or})` : ''}
            {t.never ? ` — do not: ${t.never}` : ''}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-sm">Clamps needed ≈ {summary.clampCount}</p>

      <h2 className="mt-6 text-lg font-medium">Guide (condensed)</h2>
      <ol className="mt-2 list-decimal pl-5 text-sm">
        {guide.map((s) => (
          <li key={s.id} className="mb-1">
            <strong>{s.title}</strong> — {s.caption}
          </li>
        ))}
      </ol>

      <h2 className="mt-6 text-lg font-medium">Care card</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {CARE_CARD.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
