// runs in the main/ui thread
export class TremoloNode extends AudioWorkletNode {
  constructor(context) {
    super(context, 'tremolo-processor');
  }
}

export function loadTremoloProcessor(context) {
  return context.audioWorklet.addModule('tremoloProcessor.js');
}
