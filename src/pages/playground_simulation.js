export function simulateOgda({
  x0,
  y0,
  stepSize,
  maxSteps = 200,
}) {
  let previous = { x: x0, y: y0 };
  let current = { x: x0, y: y0 };
  const points = [current];

  for (let step = 0; step < maxSteps; step += 1) {
    const next = {
      x: current.x - 2 * stepSize * current.y + stepSize * previous.y,
      y: current.y + 2 * stepSize * current.x - stepSize * previous.x,
    };

    points.push(next);

    previous = current;
    current = next;
  }

  return points;
}
