// This is evaluated in AudioWorkletGlobalScope upon the
// audioWorklet.addModule() call in the main global scope.
class PedalProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    // audio processing code here.
  }
}

registerProcessor('pedal-processor', PedalProcessor);
