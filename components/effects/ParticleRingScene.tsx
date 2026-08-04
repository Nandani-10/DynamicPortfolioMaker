"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const RING_POINTS = 1600;
const SCATTER_POINTS = 500;
const RING_RADIUS = 3.2;

function buildGeometry(palette: string[]) {
  const total = RING_POINTS + SCATTER_POINTS;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const colorObjects = palette.map((hex) => new THREE.Color(hex));

  for (let i = 0; i < total; i++) {
    const isRing = i < RING_POINTS;
    const angle = Math.random() * Math.PI * 2;

    // Ring points hug a torus band; scatter points drift around it so the
    // ring reads as a dense core inside a soft cloud.
    const radius = isRing
      ? RING_RADIUS + (Math.random() - 0.5) * 0.55
      : RING_RADIUS + (Math.random() - 0.5) * 4.2;
    const depth = isRing
      ? (Math.random() - 0.5) * 0.55
      : (Math.random() - 0.5) * 2.6;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = depth;

    const color = colorObjects[i % colorObjects.length];
    // Fade the scattered cloud so the ring stays the focal point.
    const intensity = isRing ? 1 : 0.45;
    colors[i * 3] = color.r * intensity;
    colors[i * 3 + 1] = color.g * intensity;
    colors[i * 3 + 2] = color.b * intensity;
  }

  return { positions, colors };
}

function ParticleRingPoints({ palette }: { palette: string[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => buildGeometry(palette), [palette]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.z += delta * 0.09;
    const t = state.clock.elapsedTime;
    points.rotation.x = Math.sin(t * 0.18) * 0.35;
    points.rotation.y = Math.cos(t * 0.14) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleRingScene({ palette }: { palette: string[] }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ParticleRingPoints palette={palette} />
    </Canvas>
  );
}
