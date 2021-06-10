function sigmoid(x, scale) {
  const expXScale = Math.exp(x * scale);
  return (expXScale - 1) / (expXScale + 1);
}
function sine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function cubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function sineFold(x) {
  return Math.sin(x * Math.PI) / 2 + 0.5;
}

function makeDistortionCurveSigmoid() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = sigmoid(x, 10);
  }
  return curve;
}

function makeDistortionCurveSineFold() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = sineFold(x) * 2 - 1;
  }
  return curve;
}
function makeDistortionCurveSine() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0;

  for (; i < samples; ++i) {
    curve[i] = sine(i / samples) * 2 - 1;
  }
  return curve;
}
function makeDistortionCurveCubic() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0;

  for (; i < samples; ++i) {
    curve[i] = cubic(i / samples) * 2 - 1;
  }
  return curve;
}
function makeDistortionCurveRectifyFull() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = Math.abs(x);
  }
  return curve;
}
function makeDistortionCurveRectifyHalf() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = x < 0 ? 0 : x;
  }
  return curve;
}
function makeDistortionCurveLinear() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = x;
  }
  return curve;
}

function makeDistortionCurveHardClip() {
  var samples = 256,
    curve = new Float32Array(samples),
    i = 0,
    x;

  for (; i < samples; ++i) {
    x = (i * 2) / samples - 1;
    curve[i] = ((x > 0.8 ? 0.8 : x < -0.8 ? -0.8 : x) * 1) / 0.8;
  }
  return curve;
}

export default {
  linear: makeDistortionCurveLinear,
  sine: makeDistortionCurveSine,
  cubic: makeDistortionCurveCubic,
  sigmoid: makeDistortionCurveSigmoid,
  sinefold: makeDistortionCurveSineFold,
  hardclip: makeDistortionCurveHardClip,
  rectify: makeDistortionCurveRectifyFull,
  halfrectify: makeDistortionCurveRectifyHalf,
};
