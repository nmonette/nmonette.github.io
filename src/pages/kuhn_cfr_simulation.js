export const KUHN_CARDS = ["J", "Q", "K"];

const ACTIONS = ["p", "b"];
const DEALS = KUHN_CARDS.flatMap((firstCard) =>
  KUHN_CARDS.filter((secondCard) => secondCard !== firstCard).map(
    (secondCard) => [firstCard, secondCard],
  ),
);

const PLAYER_INFOSETS = [
  KUHN_CARDS.flatMap((card) => [`${card}|`, `${card}|pb`]),
  KUHN_CARDS.flatMap((card) => [`${card}|p`, `${card}|b`]),
];

const CARD_VALUE = { J: 0, Q: 1, K: 2 };

function isTerminal(history) {
  return (
    history === "pp" ||
    history === "bp" ||
    history === "bb" ||
    history === "pbp" ||
    history === "pbb"
  );
}

export function terminalPayoff(cards, history) {
  const firstPlayerWins = CARD_VALUE[cards[0]] > CARD_VALUE[cards[1]];

  if (history === "pp") return firstPlayerWins ? 1 : -1;
  if (history === "bp") return 1;
  if (history === "pbp") return -1;
  if (history === "bb" || history === "pbb") {
    return firstPlayerWins ? 2 : -2;
  }

  throw new Error(`Unknown terminal Kuhn history: ${history}`);
}

function regretMatchedStrategy(regretSum) {
  const positive = regretSum.map((regret) => Math.max(regret, 0));
  const normalizer = positive[0] + positive[1];

  if (normalizer <= 0) return [0.5, 0.5];
  return positive.map((regret) => regret / normalizer);
}

function createNodes() {
  return Object.fromEntries(
    [...PLAYER_INFOSETS[0], ...PLAYER_INFOSETS[1]].map((key) => [
        key,
        {
          regretSum: [0, 0],
          strategySum: [0, 0],
        },
      ]),
  );
}

function runCfrEpoch(nodes) {
  const frozenStrategies = Object.fromEntries(
    Object.entries(nodes).map(([key, node]) => [
      key,
      regretMatchedStrategy(node.regretSum),
    ]),
  );
  const regretDelta = Object.fromEntries(
    Object.keys(nodes).map((key) => [key, [0, 0]]),
  );
  const strategyDelta = Object.fromEntries(
    Object.keys(nodes).map((key) => [key, [0, 0]]),
  );

  function traverse(cards, history, firstReach, secondReach) {
    if (isTerminal(history)) {
      const firstPayoff = terminalPayoff(cards, history);
      return history.length % 2 === 0 ? firstPayoff : -firstPayoff;
    }

    const player = history.length % 2;
    const key = `${cards[player]}|${history}`;
    const strategy = frozenStrategies[key];
    const actionValues = [0, 0];
    let nodeValue = 0;

    for (let action = 0; action < ACTIONS.length; action += 1) {
      const nextHistory = history + ACTIONS[action];
      actionValues[action] =
        player === 0
          ? -traverse(
              cards,
              nextHistory,
              firstReach * strategy[action],
              secondReach,
            )
          : -traverse(
              cards,
              nextHistory,
              firstReach,
              secondReach * strategy[action],
            );
      nodeValue += strategy[action] * actionValues[action];
    }

    const opponentReach = player === 0 ? secondReach : firstReach;
    const ownReach = player === 0 ? firstReach : secondReach;

    for (let action = 0; action < ACTIONS.length; action += 1) {
      regretDelta[key][action] +=
        opponentReach * (actionValues[action] - nodeValue);
      strategyDelta[key][action] += ownReach * strategy[action];
    }

    return nodeValue;
  }

  for (const cards of DEALS) {
    traverse(cards, "", 1, 1);
  }

  for (const key of Object.keys(nodes)) {
    for (let action = 0; action < ACTIONS.length; action += 1) {
      nodes[key].regretSum[action] += regretDelta[key][action] / DEALS.length;
      nodes[key].strategySum[action] += strategyDelta[key][action] / DEALS.length;
    }
  }
}

function averageStrategy(nodes) {
  return Object.fromEntries(
    Object.entries(nodes).map(([key, node]) => {
      const normalizer = node.strategySum[0] + node.strategySum[1];
      if (normalizer <= 0) return [key, [0.5, 0.5]];
      return [
        key,
        node.strategySum.map((weight) => weight / normalizer),
      ];
    }),
  );
}

function evaluateDeal(strategy, cards, history = "") {
  if (isTerminal(history)) return terminalPayoff(cards, history);

  const player = history.length % 2;
  const key = `${cards[player]}|${history}`;
  const probabilities = strategy[key];

  return probabilities.reduce(
    (value, probability, action) =>
      value +
      probability * evaluateDeal(strategy, cards, history + ACTIONS[action]),
    0,
  );
}

function expectedValue(strategy) {
  return (
    DEALS.reduce(
      (total, cards) => total + evaluateDeal(strategy, cards),
      0,
    ) / DEALS.length
  );
}

function pureStrategy(keys, mask) {
  return Object.fromEntries(
    keys.map((key, index) => {
      const action = (mask >> index) & 1;
      return [key, action === 0 ? [1, 0] : [0, 1]];
    }),
  );
}

function bestResponseValue(average, player) {
  const keys = PLAYER_INFOSETS[player];
  let bestValue = player === 0 ? -Infinity : Infinity;

  for (let mask = 0; mask < 2 ** keys.length; mask += 1) {
    const candidate = {
      ...average,
      ...pureStrategy(keys, mask),
    };
    const value = expectedValue(candidate);
    bestValue =
      player === 0
        ? Math.max(bestValue, value)
        : Math.min(bestValue, value);
  }

  return bestValue;
}

export function solveKuhnExploitability(strategy) {
  const value = expectedValue(strategy);
  const firstBestResponse = bestResponseValue(strategy, 0);
  const secondBestResponse = bestResponseValue(strategy, 1);

  return {
    value,
    firstBestResponse,
    secondBestResponse,
    exploitability: (firstBestResponse - secondBestResponse) / 2,
  };
}

function createSnapshot(nodes, iteration) {
  const strategy = averageStrategy(nodes);
  return {
    iteration,
    strategy,
    regrets: Object.fromEntries(
      Object.entries(nodes).map(([key, node]) => [
        key,
        [...node.regretSum],
      ]),
    ),
    ...solveKuhnExploitability(strategy),
  };
}

export function createKuhnCfrRun({
  maxIterations = 2000,
  snapshotEvery = 5,
} = {}) {
  const nodes = createNodes();
  const snapshots = [createSnapshot(nodes, 0)];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    runCfrEpoch(nodes);
    if (iteration % snapshotEvery === 0 || iteration === maxIterations) {
      snapshots.push(createSnapshot(nodes, iteration));
    }
  }

  return snapshots;
}
