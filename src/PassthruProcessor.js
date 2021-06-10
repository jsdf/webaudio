class PassthruProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const firstInput = inputs[0];
    const firstOutput = outputs[0];
    for (let channel = 0; channel < firstInput.length; channel++) {
      for (let sample = 0; sample < firstInput[channel].length; sample++) {
        firstOutput[channel][sample] = firstInput[channel][sample];
      }
    }
    return true;
  }
}
