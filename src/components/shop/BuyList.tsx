import { useDerived } from '../../state/boardStore';

/** Thin wrapper used by shop ticket / print */
export function BuyList() {
  const { summary } = useDerived();
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {summary.buyList.map((b) => (
        <li key={b.woodId} className="tabular">
          {b.label} · {b.boardFeet} bf
        </li>
      ))}
    </ul>
  );
}
