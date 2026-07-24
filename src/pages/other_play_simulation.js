export const LEVER_PAYOFFS = [
  [1, -1, -1],
  [-1, 0.5, -1],
  [-1, -1, 1],
];

export const LEVER_PERMUTATIONS = [
  [0, 1, 2],
  [2, 1, 0],
];

function softmax(logits) {
  const maximum = Math.max(...logits);
  const exponentials = logits.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function sampleCategorical(probabilities) {
  const draw = Math.random();
  let cumulative = 0;

  for (let index = 0; index < probabilities.length; index += 1) {
    cumulative += probabilities[index];
    if (draw <= cumulative) return index;
  }

  return probabilities.length - 1;
}

function environmentPolicy(policy, permutation) {
  const permuted = policy.map(() => 0);
  policy.forEach((probability, internalAction) => {
    permuted[permutation[internalAction]] = probability;
  });
  return permuted;
}

function expectedUtility(policyA, policyB, permutation) {
  const policyBEnvironment = environmentPolicy(policyB, permutation);

  return policyA.reduce(
    (utility, probabilityA, actionA) =>
      utility +
      probabilityA *
        policyBEnvironment.reduce(
          (actionUtility, probabilityB, actionB) =>
            actionUtility +
            probabilityB * LEVER_PAYOFFS[actionA][actionB],
          0,
        ),
    0,
  );
}

function zeroShotUtility(policyA, policyB) {
  return (
    LEVER_PERMUTATIONS.reduce(
      (utility, permutation) =>
        utility + expectedUtility(policyA, policyB, permutation),
      0,
    ) / LEVER_PERMUTATIONS.length
  );
}

function policyGradients(logitsA, logitsB, permutations) {
  const policyA = softmax(logitsA);
  const policyB = softmax(logitsB);
  const gradientA = [0, 0, 0];
  const gradientB = [0, 0, 0];

  permutations.forEach((permutation) => {
    const policyBEnvironment = environmentPolicy(policyB, permutation);
    const valuesA = LEVER_PAYOFFS.map((row) =>
      row.reduce(
        (value, reward, actionB) =>
          value + reward * policyBEnvironment[actionB],
        0,
      ),
    );
    const valuesB = policyB.map((_, internalAction) =>
      policyA.reduce(
        (value, probabilityA, actionA) =>
          value +
          probabilityA *
            LEVER_PAYOFFS[actionA][permutation[internalAction]],
        0,
      ),
    );
    const utility = policyA.reduce(
      (value, probability, action) =>
        value + probability * valuesA[action],
      0,
    );

    policyA.forEach((probability, action) => {
      gradientA[action] +=
        (probability * (valuesA[action] - utility)) / permutations.length;
    });
    policyB.forEach((probability, action) => {
      gradientB[action] +=
        (probability * (valuesB[action] - utility)) / permutations.length;
    });
  });

  return { gradientA, gradientB };
}

function demonstration(policyA, policyB, permutation) {
  const actionA = sampleCategorical(policyA);
  const actionBInternal = sampleCategorical(policyB);
  const actionBEnvironment = permutation[actionBInternal];

  return {
    actionA,
    actionBInternal,
    actionBEnvironment,
    labelToLever: permutation.map((environmentAction) => environmentAction + 1),
    reward: LEVER_PAYOFFS[actionA][actionBEnvironment],
  };
}

export function createOtherPlayRun({
  maxIterations = 260,
  learningRate = 0.22,
} = {}) {
  let otherLogitsA = [0, 0.42, 0];
  let otherLogitsB = [0, 0.42, 0];
  let selfLogitsA = [0.18, -0.12, 0];
  let selfLogitsB = [0.16, -0.1, 0.02];
  const history = [];

  for (let iteration = 0; iteration <= maxIterations; iteration += 1) {
    const otherPolicyA = softmax(otherLogitsA);
    const otherPolicyB = softmax(otherLogitsB);
    const selfPolicyA = softmax(selfLogitsA);
    const selfPolicyB = softmax(selfLogitsB);
    const otherPermutation =
      LEVER_PERMUTATIONS[
        Math.floor(Math.random() * LEVER_PERMUTATIONS.length)
      ];

    history.push({
      iteration,
      otherPlay: {
        policyA: otherPolicyA,
        policyB: otherPolicyB,
        utility: zeroShotUtility(otherPolicyA, otherPolicyB),
        demonstration: demonstration(
          otherPolicyA,
          otherPolicyB,
          otherPermutation,
        ),
      },
      selfPlay: {
        policyA: selfPolicyA,
        policyB: selfPolicyB,
        utility: zeroShotUtility(selfPolicyA, selfPolicyB),
        demonstration: demonstration(
          selfPolicyA,
          selfPolicyB,
          LEVER_PERMUTATIONS[0],
        ),
      },
    });

    if (iteration === maxIterations) break;

    const otherGradients = policyGradients(
      otherLogitsA,
      otherLogitsB,
      LEVER_PERMUTATIONS,
    );
    const selfGradients = policyGradients(
      selfLogitsA,
      selfLogitsB,
      [LEVER_PERMUTATIONS[0]],
    );

    otherLogitsA = otherLogitsA.map(
      (value, action) =>
        value + learningRate * otherGradients.gradientA[action],
    );
    otherLogitsB = otherLogitsB.map(
      (value, action) =>
        value + learningRate * otherGradients.gradientB[action],
    );
    selfLogitsA = selfLogitsA.map(
      (value, action) =>
        value + learningRate * selfGradients.gradientA[action],
    );
    selfLogitsB = selfLogitsB.map(
      (value, action) =>
        value + learningRate * selfGradients.gradientB[action],
    );
  }

  return history;
}
