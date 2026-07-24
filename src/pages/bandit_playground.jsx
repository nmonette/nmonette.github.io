import { useEffect, useMemo, useRef, useState } from "react";

import NavButton from "./nav_button.jsx";
import PlaygroundNav from "./playground_nav.jsx";
import {
  BANDIT_ARMS,
  betaDensity,
  createBanditRun,
} from "./bandit_simulation.js";
import "./playground.css";
import "./bandit_playground.css";

const MAX_TRIALS = 300;
const MILLISECONDS_PER_TRIAL = 55;

function BeliefPlot({ arm, alpha, beta, pulls, selected, index }) {
  const width = 470;
  const height = 92;
  const margin = { top: 8, right: 15, bottom: 19, left: 20 };
  const plotWidth = width - margin.left - margin.right;
  const baseline = height - margin.bottom;

  const density = useMemo(() => betaDensity(alpha, beta), [alpha, beta]);
  const maxDensity = Math.max(...density.map((point) => point.y), 1);
  const points = density.map((point) => ({
    x: margin.left + point.x * plotWidth,
    y:
      baseline -
      (point.y / maxDensity) * (baseline - margin.top),
  }));
  const linePath = points
    .map(
      (point, pointIndex) =>
        `${pointIndex === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
  const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${baseline} L ${points[0].x.toFixed(2)} ${baseline} Z`;
  const truthX = margin.left + arm.probability * plotWidth;
  const posteriorMean = alpha / (alpha + beta);
  const meanX = margin.left + posteriorMean * plotWidth;
  const gradientId = `belief-fill-${index}`;

  return (
    <article className={`belief-row${selected ? " selected" : ""}`}>
      <div className="belief-row-header">
        <div>
          <strong>{arm.name}</strong>
          <span>Beta({alpha}, {beta})</span>
        </div>
        <div className="belief-meta">
          <span>{pulls} pulls</span>
          <strong>true p = {arm.probability.toFixed(2)}</strong>
        </div>
      </div>

      <svg
        className="belief-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${arm.name} posterior belief with true probability ${arm.probability}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66ccff" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#66ccff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const x = margin.left + tick * plotWidth;
          return (
            <g key={tick}>
              <line
                x1={x}
                x2={x}
                y1={margin.top}
                y2={baseline}
                className="belief-grid"
              />
              <text x={x} y={height - 7} className="belief-tick">
                {tick.toFixed(2).replace("0.", ".")}
              </text>
            </g>
          );
        })}

        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={baseline}
          y2={baseline}
          className="belief-axis"
        />
        <path d={fillPath} fill={`url(#${gradientId})`} />
        <path d={linePath} className="belief-density" />
        <line
          x1={truthX}
          x2={truthX}
          y1={margin.top}
          y2={baseline}
          className="truth-line"
        />
        <circle
          cx={meanX}
          cy={baseline}
          r="4.5"
          className="posterior-mean"
        />
      </svg>
    </article>
  );
}

function RegretPlot({ history, fullHistory }) {
  const width = 640;
  const height = 430;
  const margin = { top: 28, right: 22, bottom: 54, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const finalRegret = fullHistory[fullHistory.length - 1].cumulativeRegret;
  const yMax = Math.max(4, Math.ceil(finalRegret / 2) * 2);
  const xScale = (trial) => margin.left + (trial / MAX_TRIALS) * plotWidth;
  const yScale = (regret) =>
    margin.top + plotHeight - (regret / yMax) * plotHeight;

  const current = history[history.length - 1] ?? fullHistory[0];
  const safeHistory = history.length > 0 ? history : [current];
  const regretPath = safeHistory
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${xScale(point.trial).toFixed(2)} ${yScale(point.cumulativeRegret).toFixed(2)}`,
    )
    .join(" ");
  return (
    <svg
      className="regret-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Cumulative regret after ${current.trial} trials`}
    >
      {[0, 75, 150, 225, 300].map((tick) => {
        const x = xScale(tick);
        return (
          <g key={tick}>
            <line
              x1={x}
              x2={x}
              y1={margin.top}
              y2={margin.top + plotHeight}
              className="regret-grid"
            />
            <text
              x={x}
              y={height - 27}
              className="regret-tick"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
        const value = yMax * fraction;
        const y = yScale(value);
        return (
          <g key={fraction}>
            <line
              x1={margin.left}
              x2={margin.left + plotWidth}
              y1={y}
              y2={y}
              className="regret-grid"
            />
            <text
              x={margin.left - 12}
              y={y}
              className="regret-tick regret-y-tick"
            >
              {value.toFixed(value < 10 ? 1 : 0)}
            </text>
          </g>
        );
      })}

      <line
        x1={margin.left}
        x2={margin.left + plotWidth}
        y1={margin.top + plotHeight}
        y2={margin.top + plotHeight}
        className="regret-axis"
      />
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={margin.top + plotHeight}
        className="regret-axis"
      />

      <path d={regretPath} className="regret-curve" />
      <circle
        cx={xScale(current.trial)}
        cy={yScale(current.cumulativeRegret)}
        r="5"
        className="regret-endpoint"
      />

      <text
        x={margin.left + plotWidth / 2}
        y={height - 4}
        className="regret-label"
      >
        trials
      </text>
      <text
        x="17"
        y={margin.top + plotHeight / 2}
        className="regret-label"
        transform={`rotate(-90 17 ${margin.top + plotHeight / 2})`}
      >
        regret
      </text>
    </svg>
  );
}

function BanditPlayground() {
  const [run, setRun] = useState(() =>
    createBanditRun({ maxTrials: MAX_TRIALS }),
  );
  const [trialIndex, setTrialIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const trialRef = useRef(0);
  const animationFrameRef = useRef(null);
  const animationEpochRef = useRef(0);
  const safeTrialIndex = Math.min(
    Math.max(Number.isFinite(trialIndex) ? trialIndex : 0, 0),
    run.length - 1,
  );
  const current = run[safeTrialIndex] ?? run[0];
  const visibleHistory = run.slice(0, safeTrialIndex + 1);

  useEffect(() => {
    if (!isRunning) return undefined;

    const startingTrial = trialRef.current;
    const startedAt = window.performance.now();
    const animationEpoch = animationEpochRef.current;

    const animate = (now) => {
      if (animationEpoch !== animationEpochRef.current) return;

      const elapsedTrials = Math.max(
        0,
        Math.floor((now - startedAt) / MILLISECONDS_PER_TRIAL),
      );
      const nextTrial = Math.min(
        Math.max(startingTrial + elapsedTrials, 0),
        run.length - 1,
      );

      if (nextTrial !== trialRef.current) {
        trialRef.current = nextTrial;
        setTrialIndex(nextTrial);
      }

      if (nextTrial >= run.length - 1) {
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

    if (trialIndex >= run.length - 1) {
      trialRef.current = 0;
      setTrialIndex(0);
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
    trialRef.current = 0;
    setTrialIndex(0);
    setRun(createBanditRun({ maxTrials: MAX_TRIALS }));
  };

  const selectedArm =
    current.chosenArm === null ? "—" : BANDIT_ARMS[current.chosenArm].name;
  const observedReward =
    current.reward === null ? "—" : current.reward === 1 ? "success" : "failure";

  return (
    <main className="playground-page bandit-page">
      <NavButton alwaysHome />

      <header className="playground-header">
        <PlaygroundNav current={2} />
        <h1>Thompson sampling for bandits</h1>
      </header>

      <section className="bandit-shell">
        <div className="bandit-status">
          <div className="bandit-live-metrics" aria-live="polite">
            <span>
              trial <strong>{current.trial}</strong> / {MAX_TRIALS}
            </span>
            <span>
              selected <strong>{selectedArm}</strong>
            </span>
            <span>
              outcome <strong>{observedReward}</strong>
            </span>
            <span>
              regret <strong>{current.cumulativeRegret.toFixed(2)}</strong>
            </span>
          </div>
          <div className="bandit-playback">
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

        <div className="bandit-panels">
          <section className="bandit-card beliefs-card">
            <div className="bandit-card-heading">
              <div>
                <p className="panel-label">Posterior beliefs</p>
                <h2>Bernoulli arms</h2>
              </div>
              <div className="belief-legend">
                <span className="legend-belief">belief</span>
                <span className="legend-truth">ground truth</span>
              </div>
            </div>

            <div className="belief-list">
              {BANDIT_ARMS.map((arm, index) => (
                <BeliefPlot
                  key={arm.name}
                  arm={arm}
                  alpha={current.alphas[index]}
                  beta={current.betas[index]}
                  pulls={current.pulls[index]}
                  selected={current.chosenArm === index}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section className="bandit-card regret-card">
            <div className="bandit-card-heading">
              <div>
                <p className="panel-label">Performance</p>
                <h2>Cumulative regret</h2>
              </div>
              <span className="regret-value">
                {current.cumulativeRegret.toFixed(2)}
              </span>
            </div>
            <div className="regret-chart-wrap">
              <RegretPlot history={visibleHistory} fullHistory={run} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default BanditPlayground;
