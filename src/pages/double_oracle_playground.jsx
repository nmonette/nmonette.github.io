import { useEffect, useMemo, useRef, useState } from "react";

import NavButton from "./nav_button.jsx";
import PlaygroundNav from "./playground_nav.jsx";
import { createDoubleOracleRun } from "./double_oracle_simulation.js";
import "./playground.css";
import "./double_oracle_playground.css";

const MILLISECONDS_PER_STEP = 850;

function Allocation({ value }) {
  return (
    <span className="oracle-allocation">
      {value.map((troops, index) => (
        <i key={index}>{troops}</i>
      ))}
    </span>
  );
}

function PayoffMatrix({ snapshot }) {
  const newestRow = snapshot.rowPopulation.length - 1;
  const newestColumn = snapshot.columnPopulation.length - 1;

  return (
    <div className="oracle-matrix-stage">
      <div className="oracle-matrix-scroll">
        <table className="oracle-matrix">
          <thead>
            <tr>
              <th aria-hidden="true" />
              {snapshot.columnPopulation.map((allocation, column) => (
                <th
                  key={allocation.join("-")}
                  className={column === newestColumn ? "new-column" : ""}
                  scope="col"
                >
                  <strong>
                    b<sub>{column}</sub>
                  </strong>
                  <Allocation value={allocation} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.rowPopulation.map((allocation, row) => (
              <tr
                key={allocation.join("-")}
                className={row === newestRow ? "new-row" : ""}
              >
                <th scope="row">
                  <strong>
                    a<sub>{row}</sub>
                  </strong>
                  <Allocation value={allocation} />
                </th>
                {snapshot.matrix[row].map((value, column) => (
                  <td
                    key={`${row}-${column}`}
                    className={[
                      value > 0 ? "positive" : value < 0 ? "negative" : "zero",
                      column === newestColumn ? "new-column" : "",
                    ].join(" ")}
                  >
                    {value > 0 ? `+${value}` : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExploitabilityChart({ snapshots, currentIndex }) {
  const width = 560;
  const height = 570;
  const margin = { top: 28, right: 23, bottom: 57, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const finalStep = Math.max(snapshots.length - 1, 1);
  const yMax =
    Math.ceil(
      Math.max(...snapshots.map((point) => point.exploitability), 0.1) * 10,
    ) / 10;
  const xScale = (step) => margin.left + (step / finalStep) * plotWidth;
  const yScale = (value) =>
    margin.top + plotHeight - (value / yMax) * plotHeight;
  const visible = snapshots.slice(0, currentIndex + 1);
  const current = visible[visible.length - 1];
  const path = visible
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${xScale(point.step).toFixed(2)} ${yScale(
          point.exploitability,
        ).toFixed(2)}`,
    )
    .join(" ");
  const xTicks = [...new Set([0, Math.round(finalStep / 3), Math.round((2 * finalStep) / 3), finalStep])];

  return (
    <svg
      className="oracle-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Exploitability ${current.exploitability.toFixed(3)} at Double Oracle step ${current.step}`}
    >
      {xTicks.map((tick) => {
        const x = xScale(tick);
        return (
          <g key={tick}>
            <line x1={x} x2={x} y1={margin.top} y2={margin.top + plotHeight} className="oracle-chart-grid" />
            <text x={x} y={height - 30} className="oracle-chart-tick">{tick}</text>
          </g>
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
        const value = yMax * fraction;
        const y = yScale(value);
        return (
          <g key={fraction}>
            <line x1={margin.left} x2={margin.left + plotWidth} y1={y} y2={y} className="oracle-chart-grid" />
            <text x={margin.left - 11} y={y} className="oracle-chart-tick y">{value.toFixed(2)}</text>
          </g>
        );
      })}
      <line x1={margin.left} x2={margin.left + plotWidth} y1={margin.top + plotHeight} y2={margin.top + plotHeight} className="oracle-chart-axis" />
      <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + plotHeight} className="oracle-chart-axis" />
      <path d={path} className="oracle-chart-halo" />
      <path d={path} className="oracle-chart-line" />
      {visible.map((point) => (
        <circle
          key={point.step}
          cx={xScale(point.step)}
          cy={yScale(point.exploitability)}
          r={point.step === current.step ? 5 : 3}
          className={point.step === current.step ? "oracle-chart-point current" : "oracle-chart-point"}
        />
      ))}
      <text x={margin.left + plotWidth / 2} y={height - 5} className="oracle-chart-label">Double Oracle step</text>
      <text x="17" y={margin.top + plotHeight / 2} className="oracle-chart-label" transform={`rotate(-90 17 ${margin.top + plotHeight / 2})`}>exploitability</text>
    </svg>
  );
}

function DoubleOraclePlayground() {
  const snapshots = useMemo(() => createDoubleOracleRun(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const stepRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastStepIndex = Math.max(snapshots.length - 1, 0);
  const safeStepIndex = Math.min(
    Math.max(Number.isFinite(stepIndex) ? Math.trunc(stepIndex) : 0, 0),
    lastStepIndex,
  );
  const current = snapshots[safeStepIndex] ?? snapshots[0];

  useEffect(() => {
    if (!isRunning) return undefined;

    const startingStep = Math.min(
      Math.max(Number.isFinite(stepRef.current) ? stepRef.current : 0, 0),
      lastStepIndex,
    );
    const startedAt = window.performance.now();

    const animate = (now) => {
      const elapsedSteps = Math.max(
        0,
        Math.floor((now - startedAt) / MILLISECONDS_PER_STEP),
      );
      const nextStep = Math.min(
        Math.max(startingStep + elapsedSteps, 0),
        lastStepIndex,
      );

      if (nextStep !== stepRef.current) {
        stepRef.current = nextStep;
        setStepIndex(nextStep);
      }

      if (nextStep >= lastStepIndex) {
        animationFrameRef.current = null;
        setIsRunning(false);
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, lastStepIndex]);

  const toggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (safeStepIndex >= lastStepIndex) {
      stepRef.current = 0;
      setStepIndex(0);
    } else {
      stepRef.current = safeStepIndex;
    }
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    stepRef.current = 0;
    setStepIndex(0);
  };

  const scrub = (event) => {
    const requested = Number(event.target.value);
    const next = Math.min(
      Math.max(Number.isFinite(requested) ? Math.trunc(requested) : 0, 0),
      lastStepIndex,
    );
    setIsRunning(false);
    stepRef.current = next;
    setStepIndex(next);
  };

  return (
    <main className="playground-page oracle-page">
      <NavButton alwaysHome />

      <header className="playground-header">
        <PlaygroundNav current={5} />
        <h1>Double Oracle in Colonel Blotto</h1>
      </header>

      <section className="oracle-controls">
        <div className="oracle-playback">
          <button type="button" className="playground-button primary" onClick={toggleRun}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button type="button" className="playground-button" onClick={reset}>Reset</button>
        </div>
        <label className="oracle-scrubber">
          <span>0</span>
          <input
            type="range"
            min="0"
            max={lastStepIndex}
            value={safeStepIndex}
            onChange={scrub}
            aria-label="Double Oracle step"
          />
          <span>{lastStepIndex}</span>
        </label>
      </section>

      <section className="oracle-workspace">
        <section className="oracle-card oracle-matrix-card">
          <div className="oracle-card-heading">
            <div>
              <p className="panel-label">Population</p>
              <h2>Empirical payoff matrix</h2>
            </div>
            <strong className="oracle-population-size">
              {current.rowPopulation.length} × {current.columnPopulation.length}
            </strong>
          </div>
          <PayoffMatrix snapshot={current} />
        </section>

        <aside className="oracle-card oracle-exploitability-card">
          <div className="oracle-card-heading">
            <div>
              <p className="panel-label">Performance</p>
              <h2>Exploitability</h2>
            </div>
            <strong className="oracle-exploitability-value">
              {current.exploitability.toFixed(3)}
            </strong>
          </div>
          <div className="oracle-chart-wrap">
            <ExploitabilityChart
              snapshots={snapshots}
              currentIndex={safeStepIndex}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

export default DoubleOraclePlayground;

