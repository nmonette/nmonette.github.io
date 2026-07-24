import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import NavButton from "./nav_button.jsx";
import PlaygroundNav from "./playground_nav.jsx";
import { simulateOgda } from "./playground_simulation.js";
import "./playground.css";

const DOMAIN_MAX = 2;
const PAYOFF_SCALE = 0.45;
const MILLISECONDS_PER_ITERATION = 42;

function PayoffSurface() {
  const domainMin = -DOMAIN_MAX;
  const domainSize = DOMAIN_MAX - domainMin;

  const geometry = useMemo(() => {
    const surface = new THREE.PlaneGeometry(
      domainSize,
      domainSize,
      32,
      32,
    );
    const positions = surface.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index) + (DOMAIN_MAX + domainMin) / 2;
      const y = positions.getY(index) + (DOMAIN_MAX + domainMin) / 2;
      positions.setXYZ(index, x, x * y * PAYOFF_SCALE, y);
    }

    positions.needsUpdate = true;
    surface.computeVertexNormals();
    return surface;
  }, [domainMin, domainSize]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#66ccff"
          opacity={0.16}
          transparent
          side={THREE.DoubleSide}
          roughness={0.72}
          metalness={0.05}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#a6dfff"
          opacity={0.24}
          transparent
          wireframe
        />
      </mesh>
    </group>
  );
}

function Axes() {
  const domainMin = -DOMAIN_MAX;
  const domainSize = DOMAIN_MAX - domainMin;
  const domainCenter = (DOMAIN_MAX + domainMin) / 2;
  const payoffExtent = DOMAIN_MAX * DOMAIN_MAX * PAYOFF_SCALE;

  return (
    <group>
      <gridHelper
        args={[domainSize, 16, "#555555", "#343434"]}
        position={[domainCenter, -0.012, domainCenter]}
      />
      <Line
        points={[
          [domainMin, 0, 0],
          [DOMAIN_MAX + 0.18, 0, 0],
        ]}
        color="#66ccff"
        lineWidth={1.5}
      />
      <Line
        points={[
          [0, 0, domainMin],
          [0, 0, DOMAIN_MAX + 0.18],
        ]}
        color="#ef4444"
        lineWidth={1.5}
      />
      <Line
        points={[
          [0, -payoffExtent - 0.18, 0],
          [0, payoffExtent + 0.18, 0],
        ]}
        color="#7b7b7b"
        lineWidth={1}
      />
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.12, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function OptimisticTrajectory({ points, iteration }) {
  const visiblePoints = points.slice(0, iteration + 1);
  const current = visiblePoints[visiblePoints.length - 1];
  const payoff = current.x * current.y * PAYOFF_SCALE;

  const surfacePoints = visiblePoints.map(({ x, y }) => [
    x,
    x * y * PAYOFF_SCALE + 0.025,
    y,
  ]);
  const floorPoints = visiblePoints.map(({ x, y }) => [x, 0.018, y]);

  if (surfacePoints.length === 1) {
    surfacePoints.push(surfacePoints[0]);
    floorPoints.push(floorPoints[0]);
  }

  return (
    <group>
      <Line
        points={surfacePoints}
        color="#f2f2f2"
        lineWidth={3}
      />
      <Line
        points={floorPoints}
        color="#ef4444"
        lineWidth={2}
        transparent
        opacity={0.58}
      />
      <Line
        points={[
          [current.x, 0.018, current.y],
          [current.x, payoff + 0.025, current.y],
        ]}
        color="#b0b0b0"
        lineWidth={1}
        dashed
        dashSize={0.04}
        gapSize={0.035}
        transparent
        opacity={0.72}
      />
      <mesh position={[current.x, payoff + 0.045, current.y]}>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshStandardMaterial
          color="#66ccff"
          emissive="#1c6688"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh
        position={[current.x, 0.035, current.y]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial
          color="#ef4444"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function Scene({ points, iteration }) {
  return (
    <>
      <color attach="background" args={["#252525"]} />
      <fog attach="fog" args={["#252525", 5.5, 9]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <PayoffSurface />
      <Axes />
      <OptimisticTrajectory points={points} iteration={iteration} />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minDistance={4}
        maxDistance={9}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.05}
        enablePan={false}
      />
    </>
  );
}

function Slider({ label, value, min, max, step, onChange, accent }) {
  return (
    <label className="playground-slider">
      <span>{label}</span>
      <output>{Number(value).toFixed(2)}</output>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        style={{ "--slider-accent": accent }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Playground() {
  const [x0, setX0] = useState(1.6);
  const [y0, setY0] = useState(0.55);
  const [stepSize, setStepSize] = useState(0.28);
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const iterationRef = useRef(0);

  const points = useMemo(
    () => simulateOgda({ x0, y0, stepSize, maxSteps: 200 }),
    [x0, y0, stepSize],
  );

  const current = points[iteration] ?? points[points.length - 1];

  useEffect(() => {
    if (!isRunning) return undefined;

    const startingIteration = iterationRef.current;
    const startedAt = window.performance.now();
    let animationFrame;

    const animate = (now) => {
      const elapsedIterations = Math.floor(
        (now - startedAt) / MILLISECONDS_PER_ITERATION,
      );
      const nextIteration = Math.min(
        startingIteration + elapsedIterations,
        points.length - 1,
      );

      if (nextIteration !== iterationRef.current) {
        iterationRef.current = nextIteration;
        setIteration(nextIteration);
      }

      if (nextIteration >= points.length - 1) {
        setIsRunning(false);
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isRunning, points.length]);

  const reset = () => {
    setIsRunning(false);
    iterationRef.current = 0;
    setIteration(0);
  };

  const updateParameter = (setter) => (value) => {
    setter(value);
    iterationRef.current = 0;
    setIteration(0);
    setIsRunning(false);
  };

  const toggleRun = () => {
    if (iteration >= points.length - 1) {
      iterationRef.current = 0;
      setIteration(0);
    }
    setIsRunning((running) => !running);
  };

  const formatCoordinate = (value) =>
    Math.abs(value) < 0.0005 ? "0.000" : value.toFixed(3);

  return (
    <main className="playground-page">
      <NavButton alwaysHome />

      <header className="playground-header">
        <PlaygroundNav current={3} />
        <h1>Optimistic gradient descent</h1>
      </header>

      <section className="playground-workspace">
        <div className="visualization-card">
          <div className="visualization-toolbar">
            <div className="axis-key">
              <span className="key-item key-x">x · min</span>
              <span className="key-item key-y">y · max</span>
              <span className="key-item key-path">trajectory</span>
            </div>
            <span className="drag-hint">drag to orbit · scroll to zoom</span>
          </div>

          <div className="canvas-wrap">
            <Canvas
              camera={{
                position: [4.3, 3.7, 4.3],
                fov: 42,
              }}
              dpr={[1, 1.75]}
              gl={{ antialias: true, alpha: false }}
              fallback={
                <div className="webgl-fallback">
                  This visualization requires WebGL.
                </div>
              }
            >
              <Scene points={points} iteration={iteration} />
            </Canvas>
            <span className="axis-label axis-label-x">x</span>
            <span className="axis-label axis-label-y">y</span>
            <span className="axis-label axis-label-f">f(x,y)</span>
          </div>

          <div className="iteration-strip">
            <span>t = {iteration}</span>
            <span>x = {formatCoordinate(current.x)}</span>
            <span>y = {formatCoordinate(current.y)}</span>
            <span>xy = {formatCoordinate(current.x * current.y)}</span>
          </div>
        </div>

        <aside className="playground-panel">
          <div className="equation-card">
            <p className="panel-label">Min–max objective</p>
            <div className="objective-equation">
              <span className="objective-operator">
                min<sub>x</sub>
              </span>
              <span className="objective-operator">
                max<sub>y</sub>
              </span>
              <span className="objective-function">f(x, y) = xy</span>
            </div>
          </div>

          <div className="controls-card">
            <div className="control-heading">
              <p className="panel-label">Initial state</p>
              <span>{points.length - 1} iterations</span>
            </div>

            <Slider
              label="x₀"
              value={x0}
              min={0.1}
              max={1.9}
              step={0.05}
              accent="#66ccff"
              onChange={updateParameter(setX0)}
            />
            <Slider
              label="y₀"
              value={y0}
              min={0.1}
              max={1.9}
              step={0.05}
              accent="#ef4444"
              onChange={updateParameter(setY0)}
            />
            <Slider
              label="step size η"
              value={stepSize}
              min={0.04}
              max={0.4}
              step={0.01}
              accent="#f2f2f2"
              onChange={updateParameter(setStepSize)}
            />

            <div className="playback-controls">
              <button
                type="button"
                className="playground-button primary"
                onClick={toggleRun}
              >
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                className="playground-button"
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>

        </aside>
      </section>
    </main>
  );
}

export default Playground;
