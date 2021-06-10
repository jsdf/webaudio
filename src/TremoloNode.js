// runs in the main/ui thread
export default class TremoloNode extends AudioWorkletNode {
  constructor(context) {
    super(context, 'tremolo-processor');
  }

  static load(context) {
    return context.audioWorklet.addModule('tremoloProcessor.js');
  }
}
