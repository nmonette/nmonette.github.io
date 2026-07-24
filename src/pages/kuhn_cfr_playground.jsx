import { useEffect, useMemo, useRef, useState } from "react";

import NavButton from "./nav_button.jsx";
import PlaygroundNav from "./playground_nav.jsx";
import {
  KUHN_CARDS,
  createKuhnCfrRun,
  terminalPayoff,
} from "./kuhn_cfr_simulation.js";
import "./playground.css";
import "./kuhn_cfr_playground.css";

const MAX_ITERATIONS = 2000;
const SNAPSHOT_EVERY = 5;
const MILLISECONDS_PER_SNAPSHOT = 50;
const DEALS = KUHN_CARDS.flatMap((firstCard) =>
  KUHN_CARDS.filter((secondCard) => secondCard !== firstCard).map(
    (secondCard) => [firstCard, secondCard],
  ),
);

function probabilityFor(strategy, key) {
  return strategy[key]?.[1] ?? 0.5;
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function payoffLabel(value) {
  return value > 0 ? `+${value}` : String(value);
}

function TreeEdge({
  x1,
  y1,
  x2,
  y2,
  probability,
  label,
  labelOffset,
  labelPosition = 0.5,
}) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const edgeLength = Math.hypot(deltaX, deltaY) || 1;
  const labelX =
    x1 + deltaX * labelPosition + (-deltaY / edgeLength) * labelOffset;
  const labelY =
    y1 + deltaY * labelPosition + (deltaX / edgeLength) * labelOffset;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="kuhn-tree-edge"
        style={{
          "--edge-opacity": 0.2 + probability * 0.8,
          "--edge-width": 1.2 + probability * 3.2,
        }}
      />
      <text x={labelX} y={labelY} className="kuhn-edge-label">
        {label} · {percent(probability)}
      </text>
    </g>
  );
}

function DecisionNode({ x, y, player, card }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="21" className={`kuhn-decision-node player-${player}`} />
      <text y="-2" className="kuhn-node-player">
        P{player}
      </text>
      <text y="12" className="kuhn-node-card">
        {card}
      </text>
    </g>
  );
}

function TerminalNode({ x, y, history, cards }) {
  const payoff = terminalPayoff(cards, history);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-29"
        y="-17"
        width="58"
        height="34"
        rx="8"
        className="kuhn-terminal"
      />
      <text y="-2" className="kuhn-terminal-history">
        {history}
      </text>
      <text y="11" className={`kuhn-terminal-payoff${payoff > 0 ? " positive" : ""}`}>
        {payoffLabel(payoff)}
      </text>
    </g>
  );
}

function KuhnGameTree({ strategy, cards }) {
  const rootBet = probabilityFor(strategy, `${cards[0]}|`);
  const afterCheckBet = probabilityFor(strategy, `${cards[1]}|p`);
  const facingOpeningBetCall = probabilityFor(strategy, `${cards[1]}|b`);
  const facingDelayedBetCall = probabilityFor(strategy, `${cards[0]}|pb`);

  return (
    <svg
      className="kuhn-tree"
      viewBox="0 0 660 370"
      role="img"
      aria-label={`Kuhn Poker game tree for player one holding ${cards[0]} and player two holding ${cards[1]}`}
    >
      <TreeEdge x1={330} y1={48} x2={165} y2={118} probability={1 - rootBet} label="check" labelOffset={17} />
      <TreeEdge x1={330} y1={48} x2={495} y2={118} probability={rootBet} label="bet" labelOffset={-17} />
      <TreeEdge x1={165} y1={145} x2={72} y2={220} probability={1 - afterCheckBet} label="check" labelOffset={18} />
      <TreeEdge x1={165} y1={145} x2={255} y2={220} probability={afterCheckBet} label="bet" labelOffset={-18} />
      <TreeEdge x1={495} y1={145} x2={420} y2={220} probability={1 - facingOpeningBetCall} label="fold" labelOffset={18} />
      <TreeEdge x1={495} y1={145} x2={570} y2={220} probability={facingOpeningBetCall} label="call" labelOffset={-18} />
      <TreeEdge x1={255} y1={245} x2={205} y2={318} probability={1 - facingDelayedBetCall} label="fold" labelOffset={18} labelPosition={0.72} />
      <TreeEdge x1={255} y1={245} x2={305} y2={318} probability={facingDelayedBetCall} label="call" labelOffset={-18} labelPosition={0.72} />

      <DecisionNode x={330} y={34} player={1} card={cards[0]} />
      <DecisionNode x={165} y={132} player={2} card={cards[1]} />
      <DecisionNode x={495} y={132} player={2} card={cards[1]} />
      <DecisionNode x={255} y={232} player={1} card={cards[0]} />

      <TerminalNode x={72} y={232} history="pp" cards={cards} />
      <TerminalNode x={420} y={232} history="bp" cards={cards} />
      <TerminalNode x={570} y={232} history="bb" cards={cards} />
      <TerminalNode x={205} y={332} history="pbp" cards={cards} />
      <TerminalNode x={305} y={332} history="pbb" cards={cards} />

    </svg>
  );
}

const PLAYER_STRATEGY_PAIRS = [
  { player: "P1", betHistory: "", callHistory: "pb" },
  { player: "P2", betHistory: "p", callHistory: "b" },
];

function CompactStrategyTable({ strategy, selectedCards }) {
  return (
    <div className="kuhn-compact-strategy" aria-label="Average CFR strategy">
      <span />
      {KUHN_CARDS.map((card) => (
        <strong key={card} className="kuhn-compact-card-label">{card}</strong>
      ))}
      {PLAYER_STRATEGY_PAIRS.map((row, playerIndex) => (
        <div className="kuhn-compact-row" key={row.player}>
          <strong className={`kuhn-compact-player player-${playerIndex + 1}`}>
            {row.player}
          </strong>
          {KUHN_CARDS.map((card) => {
            const bet = probabilityFor(
              strategy,
              `${card}|${row.betHistory}`,
            );
            const call = probabilityFor(
              strategy,
              `${card}|${row.callHistory}`,
            );
            const isSelected = card === selectedCards[playerIndex];

            return (
              <div
                key={card}
                className={`kuhn-strategy-pair${isSelected ? " selected" : ""}`}
                title={`${row.player} with ${card}: ${percent(bet)} bet, ${percent(call)} call`}
              >
                <span>
                  <small>bet</small>
                  <strong>{percent(bet)}</strong>
                </span>
                <i />
                <span>
                  <small>call</small>
                  <strong>{percent(call)}</strong>
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ExploitabilityChart({ snapshots, currentIndex }) {
  const width = 560;
  const height = 455;
  const margin = { top: 25, right: 22, bottom: 55, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yMax =
    Math.ceil(
      Math.max(...snapshots.map((point) => point.exploitability), 0.1) * 10,
    ) / 10;
  const xScale = (iteration) =>
    margin.left + (iteration / MAX_ITERATIONS) * plotWidth;
  const yScale = (value) =>
    margin.top + plotHeight - (value / yMax) * plotHeight;
  const visible = snapshots.slice(0, currentIndex + 1);
  const current = visible[visible.length - 1];
  const path = visible
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${xScale(point.iteration).toFixed(2)} ${yScale(
          point.exploitability,
        ).toFixed(2)}`,
    )
    .join(" ");

  return (
    <svg
      className="kuhn-exploitability-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Exploitability ${current.exploitability.toFixed(4)} at iteration ${current.iteration}`}
    >
      {[0, 500, 1000, 1500, 2000].map((tick) => {
        const x = xScale(tick);
        return (
          <g key={tick}>
            <line x1={x} x2={x} y1={margin.top} y2={margin.top + plotHeight} className="kuhn-chart-grid" />
            <text x={x} y={height - 29} className="kuhn-chart-tick">{tick}</text>
          </g>
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
        const value = yMax * fraction;
        const y = yScale(value);
        return (
          <g key={fraction}>
            <line x1={margin.left} x2={margin.left + plotWidth} y1={y} y2={y} className="kuhn-chart-grid" />
            <text x={margin.left - 11} y={y} className="kuhn-chart-tick y">
              {value.toFixed(2)}
            </text>
          </g>
        );
      })}
      <line x1={margin.left} x2={margin.left + plotWidth} y1={margin.top + plotHeight} y2={margin.top + plotHeight} className="kuhn-chart-axis" />
      <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + plotHeight} className="kuhn-chart-axis" />
      <path d={path} className="kuhn-exploitability-area" />
      <path d={path} className="kuhn-exploitability-line" />
      <circle cx={xScale(current.iteration)} cy={yScale(current.exploitability)} r="5" className="kuhn-chart-endpoint" />
      <line x1={xScale(current.iteration)} x2={xScale(current.iteration)} y1={yScale(current.exploitability)} y2={margin.top + plotHeight} className="kuhn-current-guide" />
      <text x={margin.left + plotWidth / 2} y={height - 5} className="kuhn-chart-label">CFR iterations</text>
      <text x="17" y={margin.top + plotHeight / 2} className="kuhn-chart-label" transform={`rotate(-90 17 ${margin.top + plotHeight / 2})`}>exploitability</text>
    </svg>
  );
}

function KuhnCfrPlayground() {
  const snapshots = useMemo(
    () =>
      createKuhnCfrRun({
        maxIterations: MAX_ITERATIONS,
        snapshotEvery: SNAPSHOT_EVERY,
      }),
    [],
  );
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dealIndex, setDealIndex] = useState(4);
  const snapshotRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastSnapshotIndex = Math.max(snapshots.length - 1, 0);
  const safeSnapshotIndex = Math.min(
    Math.max(
      Number.isFinite(snapshotIndex) ? Math.trunc(snapshotIndex) : 0,
      0,
    ),
    lastSnapshotIndex,
  );
  const safeDealIndex = Math.min(
    Math.max(Number.isFinite(dealIndex) ? Math.trunc(dealIndex) : 0, 0),
    DEALS.length - 1,
  );
  const current = snapshots[safeSnapshotIndex] ?? snapshots[0];
  const selectedCards = DEALS[safeDealIndex] ?? DEALS[0];
  const activeStep = Math.floor(current.iteration / SNAPSHOT_EVERY) % 4;

  useEffect(() => {
    if (!isRunning) return undefined;

    const startingSnapshot = Math.min(
      Math.max(
        Number.isFinite(snapshotRef.current)
          ? Math.trunc(snapshotRef.current)
          : 0,
        0,
      ),
      lastSnapshotIndex,
    );
    const startedAt = window.performance.now();

    const animate = (now) => {
      const elapsed = Math.max(
        0,
        Math.floor((now - startedAt) / MILLISECONDS_PER_SNAPSHOT),
      );
      const next = Math.min(
        Math.max(startingSnapshot + elapsed, 0),
        lastSnapshotIndex,
      );

      if (next !== snapshotRef.current) {
        snapshotRef.current = next;
        setSnapshotIndex(next);
      }

      if (next >= lastSnapshotIndex) {
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
  }, [isRunning, lastSnapshotIndex]);

  const toggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (safeSnapshotIndex >= lastSnapshotIndex) {
      snapshotRef.current = 0;
      setSnapshotIndex(0);
    } else {
      snapshotRef.current = safeSnapshotIndex;
    }
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    snapshotRef.current = 0;
    setSnapshotIndex(0);
  };

  const scrub = (event) => {
    const requested = Number(event.target.value);
    const next = Math.min(
      Math.max(Number.isFinite(requested) ? Math.trunc(requested) : 0, 0),
      lastSnapshotIndex,
    );
    setIsRunning(false);
    snapshotRef.current = next;
    setSnapshotIndex(next);
  };

  return (
    <main className="playground-page kuhn-page">
      <NavButton alwaysHome />

      <header className="playground-header">
        <PlaygroundNav current={4} />
        <h1>Counterfactual regret minimization</h1>
        <h2 className="playground-subtitle">Kuhn poker</h2>
      </header>

      <section className="kuhn-controls" aria-label="Simulation controls">
        <div className="kuhn-playback">
          <button type="button" className="playground-button primary" onClick={toggleRun}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button type="button" className="playground-button" onClick={reset}>Reset</button>
        </div>
        <label className="kuhn-scrubber">
          <span>0</span>
          <input
            type="range"
            min="0"
            max={lastSnapshotIndex}
            value={safeSnapshotIndex}
            onChange={scrub}
            aria-label="CFR iteration"
          />
          <span>{MAX_ITERATIONS.toLocaleString()}</span>
        </label>
        <div className="kuhn-deal-picker">
          <span>inspect deal</span>
          <div>
            {DEALS.map((cards, index) => (
              <button
                type="button"
                key={cards.join("")}
                className={index === dealIndex ? "selected" : ""}
                onClick={() => setDealIndex(index)}
                aria-pressed={index === dealIndex}
              >
                {cards[0]}<i>/</i>{cards[1]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="kuhn-workspace">
        <div className="kuhn-left-column">
          <section className="kuhn-card kuhn-tree-card">
            <div className="kuhn-card-heading">
              <div>
                <p className="panel-label">Game tree</p>
                <h2>P1: {selectedCards[0]} <span>vs</span> P2: {selectedCards[1]}</h2>
              </div>
              <div className="kuhn-tree-legend">
                <span className="p1">P1 decision</span>
                <span className="p2">P2 decision</span>
              </div>
            </div>
            <div className="kuhn-tree-wrap">
              <KuhnGameTree strategy={current.strategy} cards={selectedCards} />
            </div>
          </section>

          <section className="kuhn-card kuhn-algorithm-card">
            <div className="kuhn-card-heading">
              <div>
                <p className="panel-label">CFR update</p>
                <h2>One pass through Kuhn Poker</h2>
              </div>
            </div>
            <div className={`kuhn-algorithm-flow${isRunning ? " running" : ""}`}>
              {["traverse", "counterfactual value", "update regret", "average strategy"].map((step, index) => (
                <div className={index === activeStep ? "active" : ""} key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </section>

        </div>

        <aside className="kuhn-right-column">
          <section className="kuhn-card kuhn-exploitability-card">
            <div className="kuhn-card-heading">
              <div>
                <p className="panel-label">Best-response solver</p>
                <h2>Agent exploitability</h2>
              </div>
              <div className="kuhn-live-value">
                <strong>{current.exploitability.toFixed(4)}</strong>
              </div>
            </div>
            <div className="kuhn-chart-wrap">
              <ExploitabilityChart snapshots={snapshots} currentIndex={safeSnapshotIndex} />
            </div>
          </section>

          <section className="kuhn-card kuhn-compact-strategy-card">
            <p className="panel-label">Average strategy</p>
            <CompactStrategyTable
              strategy={current.strategy}
              selectedCards={selectedCards}
            />
          </section>
        </aside>
      </section>
    </main>
  );
}

export default KuhnCfrPlayground;
