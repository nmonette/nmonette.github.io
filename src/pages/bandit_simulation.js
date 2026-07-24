export const BANDIT_ARMS = [
  { name: "Arm A", probability: 0.72 },
  { name: "Arm B", probability: 0.55 },
  { name: "Arm C", probability: 0.38 },
];

function standardNormal() {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleGamma(shape) {
  if (shape < 1) {
    return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const normal = standardNormal();
    let scaled = 1 + c * normal;

    if (scaled <= 0) continue;
    scaled **= 3;

    const uniform = Math.random();
    if (
      uniform < 1 - 0.0331 * normal ** 4 ||
      Math.log(uniform) <
        0.5 * normal ** 2 + d * (1 - scaled + Math.log(scaled))
    ) {
      return d * scaled;
    }
  }
}

function sampleBeta(alpha, beta) {
  const x = sampleGamma(alpha);
  const y = sampleGamma(beta);
  return x / (x + y);
}

export function createBanditRun({
  arms = BANDIT_ARMS,
  maxTrials = 300,
} = {}) {
  const alphas = arms.map(() => 1);
  const betas = arms.map(() => 1);
  const pulls = arms.map(() => 0);
  const bestProbability = Math.max(...arms.map((arm) => arm.probability));
  let cumulativeRegret = 0;

  const history = [
    {
      trial: 0,
      alphas: [...alphas],
      betas: [...betas],
      pulls: [...pulls],
      chosenArm: null,
      reward: null,
      cumulativeRegret,
    },
  ];

  for (let trial = 1; trial <= maxTrials; trial += 1) {
    const samples = arms.map((_, index) =>
      sampleBeta(alphas[index], betas[index]),
    );
    const chosenArm = samples.indexOf(Math.max(...samples));
    const reward = Math.random() < arms[chosenArm].probability ? 1 : 0;

    pulls[chosenArm] += 1;
    alphas[chosenArm] += reward;
    betas[chosenArm] += 1 - reward;
    cumulativeRegret += bestProbability - arms[chosenArm].probability;

    history.push({
      trial,
      alphas: [...alphas],
      betas: [...betas],
      pulls: [...pulls],
      chosenArm,
      reward,
      cumulativeRegret,
    });
  }

  return history;
}

function logGamma(value) {
  const coefficients = [
    0.9999999999998099,
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.5073432786869,
    -0.1385710952657201,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return (
      Math.log(Math.PI) -
      Math.log(Math.sin(Math.PI * value)) -
      logGamma(1 - value)
    );
  }

  const shifted = value - 1;
  let sum = coefficients[0];

  for (let index = 1; index < coefficients.length; index += 1) {
    sum += coefficients[index] / (shifted + index);
  }

  const t = shifted + coefficients.length - 1.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (shifted + 0.5) * Math.log(t) -
    t +
    Math.log(sum)
  );
}

export function betaDensity(alpha, beta, sampleCount = 90) {
  const logNormalizer =
    logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);

  return Array.from({ length: sampleCount }, (_, index) => {
    const x = 0.005 + (index / (sampleCount - 1)) * 0.99;
    const logDensity =
      (alpha - 1) * Math.log(x) +
      (beta - 1) * Math.log(1 - x) -
      logNormalizer;

    return { x, y: Math.exp(logDensity) };
  });
}
