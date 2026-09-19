import { BUILD_STAGE_META, BUILD_STAGES, type BuildStage } from '../../domain/buildStages'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Props = {
  stage: BuildStage
  onStage: (s: BuildStage) => void
}

export function BuildStageBar({ stage, onStage }: Props) {
  const meta = BUILD_STAGE_META[stage]
  const index = BUILD_STAGES.indexOf(stage)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Build
        </span>
        <ToggleGroup
          type="single"
          value={stage}
          onValueChange={(v) => {
            if (v === 'start' || v === 'cut' || v === 'glue' || v === 'final') onStage(v)
          }}
          variant="outline"
          size="sm"
        >
          {BUILD_STAGES.map((s) => (
            <ToggleGroupItem key={s} value={s} className="text-xs">
              <span className="sm:hidden">{BUILD_STAGE_META[s].short}</span>
              <span className="hidden sm:inline">{BUILD_STAGE_META[s].label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Slider
          className="hidden min-w-28 max-w-48 sm:flex"
          min={0}
          max={3}
          step={1}
          value={[index]}
          onValueChange={(v) => {
            const next = BUILD_STAGES[v[0] ?? 0]
            if (next) onStage(next)
          }}
          aria-label="Build stage"
        />
      </div>
      <p className="hidden text-[11px] leading-snug text-muted-foreground sm:block">{meta.caption}</p>
    </div>
  )
}
