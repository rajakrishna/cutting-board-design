import { PRESETS } from '../../data/templates'
import { getWood } from '../../domain/woods'
import { useBoardStore } from '../../state/boardStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PresetGallery() {
  const loadPreset = useBoardStore((s) => s.loadPreset)

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Presets</h2>
      <Select onValueChange={(id) => loadPreset(id)}>
        <SelectTrigger className="h-9 w-full border border-border bg-white focus:ring-1 focus:ring-primary">
          <SelectValue placeholder="Choose a preset..." />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id} className="py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-20 overflow-hidden rounded-sm border">
                  {p.board.strips.map((s, i) => (
                    <span
                      key={`${p.id}-${i}`}
                      className="h-full"
                      style={{
                        background: getWood(s.woodId)?.color ?? '#ccc',
                        flexGrow: s.width,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm">{p.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
