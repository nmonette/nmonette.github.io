import { useEffect, useRef, useState } from "react";

import NavButton from "./nav_button.jsx";
import PlaygroundNav from "./playground_nav.jsx";
import { createOtherPlayRun } from "./other_play_simulation.js";
import "./playground.css";
import "./other_playground.css";

const MAX_ITERATIONS = 260;
const MILLISECONDS_PER_ITERATION = 55;

function LeverDemonstration({ title, subtitle, state, color }) {
  const { demonstration } = state;
  const rewardLabel =
    demonstration.reward > 0
      ? `+${demonstration.reward.toFixed(
          Number.isInteger(demonstration.reward) ? 0 : 1,
        )}`
      : demonstration.reward.toFixed(0);

  return (
    <article className="lever-demo" style={{ "--method-color": color }}>
      <header className="lever-demo-header">
        <div>
          <p>{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <div
          className={`lever-reward ${
            demonstration.reward > 0 ? "positive" : "negative"
          }`}
        >
          <span>reward</span>
          <strong>{rewardLabel}</strong>
        </div>
      </header>

      <div className="lever-stage">
        <div className="lever-agent-label top">Physical levers</div>
        <div className="lever-columns">
          {[0, 1, 2].map((lever) => {
            const selectedByA = demonstration.actionA === lever;
            const selectedByB =
              demonstration.actionBEnvironment === lever;

            return (
              <div className="lever-column" key={lever}>
                {selectedByA && (
                  <span className="pull-marker agent-a active">A</span>
                )}
                <div
                  className={`lever-machine${
                    selectedByA || selectedByB ? " pulled" : ""
                  }`}
                >
                  <span className="lever-knob" />
                  <span className="lever-stem" />
                  <strong>{lever + 1}</strong>
                </div>
                {selectedByB && (
                  <span className="pull-marker agent-b active">B</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="p2-permutation">
          <span>P2 permutation</span>
          <strong>({demonstration.labelToLever.join(" ")})</strong>
        </div>
      </div>
    </article>
  );
}

function UtilityPlot({ history }) {
  const width = 660;
  const height = 510;
  const margin = { top: 30, right: 24, bottom: 58, left: 68 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yMin = -0.5;
  const yMax = 0.55;
  const xScale = (iteration) =>
    margin.left + (iteration / MAX_ITERATIONS) * plotWidth;
  const yScale = (utility) =>
    margin.top +
    plotHeight -
    ((utility - yMin) / (yMax - yMin)) * plotHeight;
  const current = history[history.length - 1] ?? history[0];
  const safeHistory = history.length > 0 ? history : [current];
  const pathFor = (method) =>
    safeHistory
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${xScale(point.iteration).toFixed(
            2,
          )} ${yScale(point[method].utility).toFixed(2)}`,
      )
      .join(" ");

  return (
    <svg
      className="utility-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Zero-shot utility after ${current.iteration} training iterations`}
    >
      {[0, 65, 130, 195, 260].map((tick) => {
        const x = xScale(tick);
        return (
          <g key={tick}>
            <line
              x1={x}
              x2={x}
              y1={margin.top}
              y2={margin.top + plotHeight}
              className="utility-grid"
            />
            <text x={x} y={height - 29} className="utility-tick">
              {tick}
            </text>
          </g>
        );
      })}

      {[-0.5, -0.25, 0, 0.25, 0.5].map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={margin.left + plotWidth}
              y1={y}
              y2={y}
              className={`utility-grid${tick === 0 ? " zero" : ""}`}
            />
            <text
              x={margin.left - 12}
              y={y}
              className="utility-tick utility-y-tick"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        );
      })}

      <line
        x1={margin.left}
        x2={margin.left + plotWidth}
        y1={margin.top + plotHeight}
        y2={margin.top + plotHeight}
        className="utility-axis"
      />
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={margin.top + plotHeight}
        className="utility-axis"
      />

      <path d={pathFor("otherPlay")} className="utility-curve other" />
      <path d={pathFor("selfPlay")} className="utility-curve self" />
      <circle
        cx={xScale(current.iteration)}
        cy={yScale(current.otherPlay.utility)}
        r="5"
        className="utility-endpoint other"
      />
      <circle
        cx={xScale(current.iteration)}
        cy={yScale(current.selfPlay.utility)}
        r="5"
        className="utility-endpoint self"
      />

      <text
        x={margin.left + plotWidth / 2}
        y={height - 5}
        className="utility-label"
      >
        training iterations
      </text>
      <text
        x="18"
        y={margin.top + plotHeight / 2}
        className="utility-label"
        transform={`rotate(-90 18 ${margin.top + plotHeight / 2})`}
      >
        utility
      </text>
    </svg>
  );
}

function OtherPlayground() {
  const [run, setRun] = useState(() =>
    createOtherPlayRun({ maxIterations: MAX_ITERATIONS }),
  );
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const iterationRef = useRef(0);
  const animationFrameRef = useRef(null);
  const animationEpochRef = useRef(0);
  const safeIteration = Math.min(
    Math.max(Number.isFinite(iteration) ? iteration : 0, 0),
    run.length - 1,
  );
  const current = run[safeIteration] ?? run[0];
  const visibleHistory = run.slice(0, safeIteration + 1);

  useEffect(() => {
    if (!isRunning) return undefined;

    const startingIteration = iterationRef.current;
    const startedAt = window.performance.now();
    const animationEpoch = animationEpochRef.current;

    const animate = (now) => {
      if (animationEpoch !== animationEpochRef.current) return;

      const elapsedIterations = Math.max(
        0,
        Math.floor((now - startedAt) / MILLISECONDS_PER_ITERATION),
      );
      const nextIteration = Math.min(
        Math.max(startingIteration + elapsedIterations, 0),
        run.length - 1,
      );

      if (nextIteration !== iterationRef.current) {
        iterationRef.current = nextIteration;
        setIteration(nextIteration);
      }

      if (nextIteration >= run.length - 1) {
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
  }, [isRunning, run.length]);

  const toggleRun = () => {
    if (isRunning) {
      animationEpochRef.current += 1;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsRunning(false);
      return;
    }

    if (iteration >= run.length - 1) {
      iterationRef.current = 0;
      setIteration(0);
    }
    setIsRunning(true);
  };

  const reset = () => {
    animationEpochRef.current += 1;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
    iterationRef.current = 0;
    setIteration(0);
    setRun(createOtherPlayRun({ maxIterations: MAX_ITERATIONS }));
  };

  return (
    <main className="playground-page other-page">
      <NavButton alwaysHome />

      <header className="playground-header">
        <PlaygroundNav current={1} />
        <h1>Other-play for zero-shot coordination</h1>
      </header>

      <section className="other-shell">
        <div className="other-status">
          <div className="other-live-metrics" aria-live="polite">
            <span>
              iteration <strong>{current.iteration}</strong> / {MAX_ITERATIONS}
            </span>
            <span>
              other-play utility{" "}
              <strong>{current.otherPlay.utility.toFixed(3)}</strong>
            </span>
            <span>
              naive utility{" "}
              <strong>{current.selfPlay.utility.toFixed(3)}</strong>
            </span>
          </div>
          <div className="other-playback">
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

        <div className="other-panels">
          <section className="other-demos">
            <LeverDemonstration
              title="Other-play"
              subtitle="randomized partner labels"
              state={current.otherPlay}
              color="#ef4444"
            />
            <LeverDemonstration
              title="Naive self-play"
              subtitle="fixed partner labels"
              state={current.selfPlay}
              color="#66ccff"
            />
          </section>

          <section className="utility-card">
            <header className="utility-card-heading">
              <div>
                <p className="panel-label">Evaluation</p>
                <h2>Zero-shot utility</h2>
              </div>
              <div className="utility-legend">
                <span className="other">Other-play</span>
                <span className="self">Naive self-play</span>
              </div>
            </header>
            <div className="utility-chart-wrap">
              <UtilityPlot history={visibleHistory} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default OtherPlayground;
