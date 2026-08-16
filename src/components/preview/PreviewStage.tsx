import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { getWood } from '../../domain/woods';
import { formatInches } from '../../domain/cutList';
import { DimensionLabels } from './DimensionLabels';
import type { BoardGeometry } from '../../domain/types';

/** Zoom the preview opens at, and returns to on Fit. */
export const DEFAULT_ZOOM = 0.7;

export type Preview3DRef = {
  resetCamera: () => void;
  setZoom: (level: number) => void;
  getZoom: () => number;
};

type Props = {
  geometry: BoardGeometry;
  face: 'finished' | 'glue1';
  showDimensions: boolean;
  selectedStripId: string | null;
  onSelect: (id: string | null) => void;
  thickness: number;
  onZoomChange?: (zoom: number) => void;
};

function BoardMesh({
  geometry,
  face,
  selectedStripId,
  onSelect,
  thickness,
}: Omit<Props, 'showDimensions'>) {
  const polys = face === 'finished' ? geometry.finished : geometry.glueUp1;
  const maxX = Math.max(...polys.map((p) => p.x + p.w), 1);
  const maxY = Math.max(...polys.map((p) => p.y + p.h), 1);
  const t = face === 'finished' ? thickness : geometry.overall.thickness;

  return (
    <group position={[-maxX / 2, 0, -maxY / 2]}>
      {polys.map((p) => {
        const wood = getWood(p.woodId);
        const selected = selectedStripId != null && p.stripId.startsWith(selectedStripId);
        const baseId = p.stripId.split('-r')[0] ?? p.stripId;
        return (
          <group key={p.stripId}>
            <mesh
              position={[p.x + p.w / 2, t / 2, p.y + p.h / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(baseId);
              }}
            >
              <boxGeometry args={[Math.max(0.05, p.w), t, Math.max(0.05, p.h)]} />
              <meshStandardMaterial
                color={wood?.color ?? '#ccc'}
                emissive={selected ? '#4a90d9' : '#000000'}
                emissiveIntensity={selected ? 0.4 : 0}
              />
            </mesh>
            {selected && (
              <lineSegments position={[p.x + p.w / 2, t / 2, p.y + p.h / 2]}>
                <edgesGeometry args={[new THREE.BoxGeometry(p.w + 0.05, t + 0.05, p.h + 0.05)]} />
                <lineBasicMaterial color="#3b82f6" linewidth={2} />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
}

function CameraController({
  controlsRef,
  defaultDistance,
  onZoomChange,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  defaultDistance: number;
  onZoomChange?: (zoom: number) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !onZoomChange) return;

    const handleChange = () => {
      const dist = camera.position.length();
      const zoom = defaultDistance / dist;
      onZoomChange(Math.max(0.1, Math.min(4, zoom)));
    };

    controls.addEventListener('change', handleChange);
    return () => controls.removeEventListener('change', handleChange);
  }, [camera, controlsRef, defaultDistance, onZoomChange]);

  return null;
}

export const Preview3D = forwardRef<Preview3DRef, Props>(function Preview3D(props, ref) {
  const { geometry, showDimensions, onZoomChange } = props;
  const maxDim = Math.max(geometry.overall.length, geometry.overall.width, 10);
  const { length, width, thickness } = geometry.overall;
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const defaultDistance = maxDim * Math.sqrt(0.9 * 0.9 + 0.7 * 0.7 + 0.9 * 0.9);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      const controls = controlsRef.current;
      if (controls) {
        controls.reset();
      }
    },
    setZoom: (level: number) => {
      const controls = controlsRef.current;
      if (controls) {
        const targetDist = defaultDistance / level;
        const currentPos = controls.object.position.clone().normalize();
        controls.object.position.copy(currentPos.multiplyScalar(targetDist));
        controls.update();
      }
    },
    getZoom: () => {
      const controls = controlsRef.current;
      if (controls) {
        const dist = controls.object.position.length();
        return defaultDistance / dist;
      }
      return 1;
    },
  }), [defaultDistance]);

  return (
    <div className="relative h-full w-full bg-paper">
      <Canvas
        camera={{
          position: [
            (maxDim * 0.9) / DEFAULT_ZOOM,
            (maxDim * 0.7) / DEFAULT_ZOOM,
            (maxDim * 0.9) / DEFAULT_ZOOM,
          ],
          fov: 40,
        }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 12, 6]} intensity={0.9} />
        <BoardMesh {...props} />
        <DimensionLabels
          length={length}
          width={width}
          thickness={thickness}
          visible={showDimensions}
        />
        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
        <CameraController
          controlsRef={controlsRef}
          defaultDistance={defaultDistance}
          onZoomChange={onZoomChange}
        />
      </Canvas>
      {showDimensions && (
        <div className="absolute bottom-3 left-3 rounded-md bg-card/90 px-3 py-2 text-sm shadow-sm backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Length</div>
              <div className="font-medium">{formatInches(length)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Width</div>
              <div className="font-medium">{formatInches(width)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Thick</div>
              <div className="font-medium">{formatInches(thickness)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
