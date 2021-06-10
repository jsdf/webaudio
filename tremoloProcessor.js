// This is evaluated in AudioWorkletGlobalScope upon the
// audioWorklet.addModule() call in the main global scope.
class TremoloProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  // Static getter to define AudioParam objects in this custom processor.
  static get parameterDescriptors() {
    return [
      {
        name: 'rate',
        defaultValue: 30, // hz
        maxValue: 100,
        minValue: 0,
      },
      {
        name: 'depth',
        defaultValue: 0.3, //modulate amplitude
        maxValue: 1,
        minValue: 0,
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const firstInput = inputs[0];
    const firstOutput = outputs[0];
    // audio processing code here.
    for (let ch = 0; ch < firstInput.length; ch++) {
      for (let sample = 0; sample < firstInput[ch].length; sample++) {
        const rate =
          parameters.rate.length === 1
            ? parameters.rate[0]
            : parameters.rate[sample];
        const depth =
          parameters.depth.length === 1
            ? parameters.depth[0]
            : parameters.depth[sample];
        const t = currentFrame + sample;

        firstOutput[ch][sample] = tremolo(
          firstInput[ch][sample],
          t,
          rate,
          depth
        );
      }
    }
    return true;
  }
}

// map the value x in the range a–b to the range c–d
function remap(a, b, x, c, d) {
  if (x < a) return c;
  if (x > b) return d;
  let y = (x - a) / (b - a);
  return c + (d - c) * y;
}

function tremolo(value, t, rate, depth) {
  const periodInSamples = sampleRate * (1 / rate);

  return value * remap(-1, 1, Math.sin(t / periodInSamples), 1 - depth, 1);
}

registerProcessor('tremolo-processor', TremoloProcessor);
