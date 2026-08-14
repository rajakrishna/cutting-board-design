import { Html } from '@react-three/drei'
import { formatInches } from '../../domain/cutList'

type Props = {
  length: number
  width: number
  thickness: number
  visible: boolean
}

export function DimensionLabels({ length, width, thickness, visible }: Props) {
  if (!visible) return null

  const halfL = length / 2
  const halfW = width / 2

  return (
    <group>
      {/* Length label - front edge */}
      <Html
        position={[0, 0, halfW + 1]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-foreground/90 px-2 py-0.5 text-[11px] font-medium tabular-nums text-background shadow">
          <span className="text-background/70">L</span>
          {formatInches(length)}
        </div>
      </Html>

      {/* Width label - right edge */}
      <Html
        position={[halfL + 1, 0, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-foreground/90 px-2 py-0.5 text-[11px] font-medium tabular-nums text-background shadow">
          <span className="text-background/70">W</span>
          {formatInches(width)}
        </div>
      </Html>

      {/* Thickness label - top corner */}
      <Html
        position={[halfL + 1, thickness + 0.5, halfW + 1]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-foreground/90 px-2 py-0.5 text-[11px] font-medium tabular-nums text-background shadow">
          <span className="text-background/70">T</span>
          {formatInches(thickness)}
        </div>
      </Html>
    </group>
  )
}
