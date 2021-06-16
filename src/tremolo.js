// map the value x in the range a–b to the range c–d
function remap(a, b, x, c, d) {
  if (x < a) return c;
  if (x > b) return d;
  let y = (x - a) / (b - a);
  return c + (d - c) * y;
}

export function tremolo(value, t, rate, depth, sampleRate) {
  const period = sampleRate * (1 / rate);

  return (
    value * remap(-1, 1, Math.sin((t / period) * Math.PI * 2), 1 - depth, 1)
  );
}
