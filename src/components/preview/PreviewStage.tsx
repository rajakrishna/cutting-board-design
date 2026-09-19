import { forwardRef, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { getWood } from '../../domain/woods';
import { formatInches } from '../../domain/cutList';
import { DimensionLabels } from './DimensionLabels';
import type { BuildStage } from '../../domain/buildStages';
import { rowIndexFromStripId, type KerfCut } from '../../domain/buildStages';
import type { BoardGeometry, GrainMode, RectPoly } from '../../domain/types';
import { DEFAULT_ZOOM, frameBoardCamera, type CameraPose } from './cameraFraming';

export { DEFAULT_ZOOM };

export type Preview3DRef = {
  resetCamera: () => void;
  setZoom: (level: number) => void;
  getZoom: () => number;
};

type Props = {
  geometry: BoardGeometry;
  face: 'finished' | 'glue1';
  grainMode: GrainMode;
  buildStage: BuildStage;
  sliceGap: number;
  kerfCuts: KerfCut[];
  showDimensions: boolean;
  selectedStripId: string | null;
  onSelect: (id: string | null) => void;
  thickness: number;
  onZoomChange?: (zoom: number) => void;
};

function facePolys(geometry: BoardGeometry, face: Props['face']): RectPoly[] {
  return face === 'finished' ? geometry.finished : geometry.glueUp1;
}

function spacedPolys(polys: RectPoly[], sliceGap: number): RectPoly[] {
  if (sliceGap <= 0) return polys;
  return polys.map((p) => ({
    ...p,
    y: p.y + rowIndexFromStripId(p.stripId) * sliceGap,
  }));
}

function faceSpans(polys: RectPoly[]) {
  const spanX = Math.max(...polys.map((p) => p.x + p.w), 1);
  const spanZ = Math.max(...polys.map((p) => p.y + p.h), 1);
  return { spanX, spanZ };
}

function applyCameraPose(
  camera: THREE.Camera,
  controls: OrbitControlsImpl | null,
  pose: CameraPose,
) {
  camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
  if (controls) {
    controls.target.set(pose.target[0], pose.target[1], pose.target[2]);
    controls.update();
    controls.saveState();
  }
}

function BoardMesh({
  polys,
  selectedStripId,
  onSelect,
  thickness,
  kerfCuts,
}: {
  polys: RectPoly[];
  selectedStripId: string | null;
  onSelect: (id: string | null) => void;
  thickness: number;
  kerfCuts: KerfCut[];
}) {
  const maxX = Math.max(...polys.map((p) => p.x + p.w), 1);
  const maxY = Math.max(...polys.map((p) => p.y + p.h), 1);
  const t = thickness;

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
      {kerfCuts.map((c, i) => (
        <mesh key={`kerf-${i}`} position={[maxX / 2, t + 0.03, c.y + c.h / 2]}>
          <boxGeometry args={[maxX + 0.15, 0.06, Math.max(0.06, c.h)]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      ))}
    </group>
  );
}

function CameraController({
  controlsRef,
  pose,
  grainMode,
  buildStage,
  onZoomChange,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  pose: CameraPose;
  grainMode: GrainMode;
  buildStage: BuildStage;
  onZoomChange?: (zoom: number) => void;
}) {
  const { camera } = useThree();
  const poseRef = useRef(pose);
  poseRef.current = pose;

  useEffect(() => {
    applyCameraPose(camera, controlsRef.current, poseRef.current);
  }, [camera, controlsRef, grainMode, buildStage]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !onZoomChange) return;

    const handleChange = () => {
      const dist = camera.position.distanceTo(controls.target);
      const zoom = pose.distance / dist;
      onZoomChange(Math.max(0.1, Math.min(4, zoom)));
    };

    controls.addEventListener('change', handleChange);
    return () => controls.removeEventListener('change', handleChange);
  }, [camera, controlsRef, pose.distance, onZoomChange]);

  return null;
}

export const Preview3D = forwardRef<Preview3DRef, Props>(function Preview3D(props, ref) {
  const {
    geometry,
    face,
    grainMode,
    buildStage,
    sliceGap,
    kerfCuts,
    showDimensions,
    onZoomChange,
  } = props;
  const { length, width, thickness } = geometry.overall;
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const polys = useMemo(
    () => spacedPolys(facePolys(geometry, face), sliceGap),
    [geometry, face, sliceGap],
  );
  const { spanX, spanZ } = faceSpans(polys);
  const meshThickness = face === 'finished' ? props.thickness : geometry.overall.thickness;
  const pose = useMemo(
    () =>
      frameBoardCamera({
        spanX,
        spanZ,
        thickness: meshThickness,
        grainMode,
        stage: grainMode === 'end' ? buildStage : undefined,
      }),
    [spanX, spanZ, meshThickness, grainMode, buildStage],
  );

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      applyCameraPose(controls.object, controls, pose);
    },
    setZoom: (level: number) => {
      const controls = controlsRef.current;
      if (!controls) return;
      const targetDist = pose.distance / level;
      const offset = controls.object.position.clone().sub(controls.target);
      if (offset.lengthSq() === 0) return;
      offset.setLength(targetDist);
      controls.object.position.copy(controls.target).add(offset);
      controls.update();
    },
    getZoom: () => {
      const controls = controlsRef.current;
      if (!controls) return 1;
      const dist = controls.object.position.distanceTo(controls.target);
      return pose.distance / dist;
    },
  }), [pose]);

  return (
    <div className="relative h-full w-full bg-paper">
      <Canvas
        camera={{
          position: pose.position,
          fov: 40,
        }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 12, 6]} intensity={0.9} />
        <BoardMesh
          polys={polys}
          selectedStripId={props.selectedStripId}
          onSelect={props.onSelect}
          thickness={meshThickness}
          kerfCuts={kerfCuts}
        />
        <DimensionLabels
          length={length}
          width={width}
          thickness={thickness}
          visible={showDimensions}
        />
        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
        <CameraController
          controlsRef={controlsRef}
          pose={pose}
          grainMode={grainMode}
          buildStage={buildStage}
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
