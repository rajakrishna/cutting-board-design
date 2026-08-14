import type { GrainMode } from '../../domain/types'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Props = {
  value: GrainMode
  onChange: (m: GrainMode) => void
}

export function GrainToggle({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-muted-foreground">Grain</div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v === 'end' || v === 'long') onChange(v)
        }}
        className="w-full"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="end" className="flex-1">
          End grain
        </ToggleGroupItem>
        <ToggleGroupItem value="long" className="flex-1">
          Long grain
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Long grain = edge grain. Same first glue-up; end grain crosscuts and stands slices on end.
      </p>
    </div>
  )
}
