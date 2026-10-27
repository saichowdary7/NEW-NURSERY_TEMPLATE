import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { plants } from "@/data/plants";

const MODEL = plants[0]!.model.glb;
const LEAF_COLORS = ["#7f9a6e", "#a8b99a", "#4f7a55", "#234b32", "#c4d2b5"];

function makeLeafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.25, 0.38, 0.3, 0, 0.6);
  s.bezierCurveTo(-0.38, 0.3, -0.42, -0.25, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, 10);
  // gentle curl so leaves catch light
  const p = g.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, x * x * 0.6 - y * 0.12);
  }
  g.computeVertexNormals();
  return g;
}

function Leaves({ count, still }: { count: number; still: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(makeLeafGeometry, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * 9, y: rnd() * 8 - 3, z: (rnd() - 0.5) * 5 - 0.5,
      s: 0.18 + rnd() * 0.32, speed: 0.15 + rnd() * 0.35,
      rx: rnd() * Math.PI, ry: rnd() * Math.PI, spin: (rnd() - 0.5) * 1.2, sway: rnd() * 10,
    }));
  }, [count]);

  useFrame((state, raw) => {
    const m = ref.current; if (!m) return;
    const dt = still ? 0 : Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      d.y -= d.speed * dt;
      if (d.y < -3.5) d.y = 4.5;
      d.rx += d.spin * dt; d.ry += d.spin * 0.6 * dt;
      dummy.position.set(d.x + Math.sin(t * 0.5 + d.sway) * 0.35, d.y, d.z);
      dummy.rotation.set(d.rx, d.ry, Math.sin(t + d.sway) * 0.4);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geo, undefined, count]}
      castShadow
      onUpdate={(m) => {
        const c = new THREE.Color();
        for (let i = 0; i < count; i++) m.setColorAt(i, c.set(LEAF_COLORS[i % LEAF_COLORS.length]!));
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }}
    >
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.55} />
    </instancedMesh>
  );
}

function Plant({ still }: { still: boolean }) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return c;
  }, [scene]);
  const { pointer } = useThree();

  useFrame((state, raw) => {
    const g = group.current; if (!g) return;
    const dt = Math.min(raw, 0.05);
    const progress = Math.min(window.scrollY / window.innerHeight, 1.2);
    const targetRotY = (still ? 0 : state.clock.elapsedTime * 0.25) + pointer.x * 0.5 + progress * Math.PI;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.12, 3, dt);
    const s = 1 + progress * 0.35; // emerges toward the viewer as you scroll
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 4, dt));
    g.position.y = THREE.MathUtils.damp(g.position.y, -progress * 0.8, 4, dt);
  });

  return (
    <group ref={group}>
      <Center top position={[0, -1.35, 0]}>
        <primitive object={cloned} scale={3.2} />
      </Center>
    </group>
  );
}

function CameraRig() {
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.6, 2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 0.6 + state.pointer.y * 0.3, 2, dt);
    cam.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function Hero3DScene({ mobile, still }: { mobile: boolean; still: boolean }) {
  return (
    <Canvas
      shadows
      dpr={mobile ? [1, 1.3] : [1, 1.8]}
      camera={{ position: [0, 0.6, 6.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} color="#fff4df" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#cfe0c0" />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 10, 1]} color="#fff7e8" />
        <Lightformer intensity={1} color="#d9e6cc" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer intensity={0.8} color="#f3e6cc" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Float speed={still ? 0 : 1.4} rotationIntensity={0.15} floatIntensity={still ? 0 : 0.35}>
          <Plant still={still} />
        </Float>
      </Suspense>
      <Leaves count={mobile ? 14 : 34} still={still} />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.35} scale={8} blur={2.6} far={3} color="#2f4a35" />
      {!mobile && !still && <CameraRig />}
    </Canvas>
  );
}

useGLTF.preload(MODEL);
