export const BLOTTO_TROOPS = 5;

export const BLOTTO_STRATEGIES = Array.from(
  { length: BLOTTO_TROOPS + 1 },
  (_, first) =>
    Array.from(
      { length: BLOTTO_TROOPS - first + 1 },
      (_, second) => [first, second, BLOTTO_TROOPS - first - second],
    ),
).flat();

export function blottoPayoff(rowStrategy, columnStrategy) {
  return rowStrategy.reduce(
    (payoff, troops, battlefield) =>
      payoff + Math.sign(troops - columnStrategy[battlefield]),
    0,
  );
}

function allocationKey(allocation) {
  return allocation.join("-");
}

function containsAllocation(population, allocation) {
  const key = allocationKey(allocation);
  return population.some((candidate) => allocationKey(candidate) === key);
}

function normalize(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return counts.map((count) => count / total);
}

function solveRestrictedGame(
  rowPopulation,
  columnPopulation,
  iterations,
) {
  const rowCounts = Array(rowPopulation.length).fill(1);
  const columnCounts = Array(columnPopulation.length).fill(1);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let rowBestIndex = 0;
    let rowBestValue = -Infinity;
    let columnBestIndex = 0;
    let columnBestValue = Infinity;

    for (let row = 0; row < rowPopulation.length; row += 1) {
      let value = 0;
      for (let column = 0; column < columnPopulation.length; column += 1) {
        value +=
          blottoPayoff(rowPopulation[row], columnPopulation[column]) *
          columnCounts[column];
      }
      if (value > rowBestValue) {
        rowBestValue = value;
        rowBestIndex = row;
      }
    }

    for (let column = 0; column < columnPopulation.length; column += 1) {
      let value = 0;
      for (let row = 0; row < rowPopulation.length; row += 1) {
        value +=
          rowCounts[row] *
          blottoPayoff(rowPopulation[row], columnPopulation[column]);
      }
      if (value < columnBestValue) {
        columnBestValue = value;
        columnBestIndex = column;
      }
    }

    rowCounts[rowBestIndex] += 1;
    columnCounts[columnBestIndex] += 1;
  }

  return {
    rowStrategy: normalize(rowCounts),
    columnStrategy: normalize(columnCounts),
  };
}

function expectedPayoff(
  rowAllocation,
  columnPopulation,
  columnStrategy,
) {
  return columnPopulation.reduce(
    (value, columnAllocation, index) =>
      value +
      columnStrategy[index] *
        blottoPayoff(rowAllocation, columnAllocation),
    0,
  );
}

function expectedColumnPayoff(
  rowPopulation,
  rowStrategy,
  columnAllocation,
) {
  return rowPopulation.reduce(
    (value, rowAllocation, index) =>
      value +
      rowStrategy[index] * blottoPayoff(rowAllocation, columnAllocation),
    0,
  );
}

function bestResponses(
  rowPopulation,
  columnPopulation,
  rowStrategy,
  columnStrategy,
) {
  let rowBestResponse = BLOTTO_STRATEGIES[0];
  let rowBestValue = -Infinity;
  let columnBestResponse = BLOTTO_STRATEGIES[0];
  let columnBestValue = Infinity;

  for (const allocation of BLOTTO_STRATEGIES) {
    const rowValue = expectedPayoff(
      allocation,
      columnPopulation,
      columnStrategy,
    );
    if (rowValue > rowBestValue) {
      rowBestValue = rowValue;
      rowBestResponse = allocation;
    }

    const columnValue = expectedColumnPayoff(
      rowPopulation,
      rowStrategy,
      allocation,
    );
    if (columnValue < columnBestValue) {
      columnBestValue = columnValue;
      columnBestResponse = allocation;
    }
  }

  return {
    rowBestResponse,
    rowBestValue,
    columnBestResponse,
    columnBestValue,
  };
}

function matrixFor(rowPopulation, columnPopulation) {
  return rowPopulation.map((rowAllocation) =>
    columnPopulation.map((columnAllocation) =>
      blottoPayoff(rowAllocation, columnAllocation),
    ),
  );
}

export function createDoubleOracleRun({
  maxSteps = 18,
  solverIterations = 60000,
} = {}) {
  const rowPopulation = [[BLOTTO_TROOPS, 0, 0]];
  const columnPopulation = [[BLOTTO_TROOPS, 0, 0]];
  const snapshots = [];

  for (let step = 0; step < maxSteps; step += 1) {
    const { rowStrategy, columnStrategy } = solveRestrictedGame(
      rowPopulation,
      columnPopulation,
      solverIterations,
    );
    const responses = bestResponses(
      rowPopulation,
      columnPopulation,
      rowStrategy,
      columnStrategy,
    );

    snapshots.push({
      step,
      rowPopulation: rowPopulation.map((allocation) => [...allocation]),
      columnPopulation: columnPopulation.map((allocation) => [...allocation]),
      matrix: matrixFor(rowPopulation, columnPopulation),
      rowStrategy,
      columnStrategy,
      exploitability:
        (responses.rowBestValue - responses.columnBestValue) / 2,
    });

    const addRow = !containsAllocation(
      rowPopulation,
      responses.rowBestResponse,
    );
    const addColumn = !containsAllocation(
      columnPopulation,
      responses.columnBestResponse,
    );

    if (!addRow && !addColumn) break;
    if (addRow) rowPopulation.push([...responses.rowBestResponse]);
    if (addColumn) columnPopulation.push([...responses.columnBestResponse]);
  }

  return snapshots;
}

