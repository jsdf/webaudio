import {WAMController} from './wam-controller';

const paramNames = [
  'Dry',
  'Wet',
  'PreDelay',
  'InputLowDamp',
  'InputHighDamp',

  'Size',
  'Diffusion',
  'Decay',
  'ReverbHighDamp',
  'ReverbLowDamp',

  'ModSpeed',
  'ModShape',
  'ModDepth',

  'Freeze',
  'Clear',
  'FreezeToggle',
  'ClearToggle',

  'DryCv',
  'WetCv',
  'InputLowDampCv',
  'InputHighDampCv',

  'SizeCv',
  'DiffusionCv',
  'DecayCv',
  'ReverbHighDampCv',
  'ReverbLowDampCv',

  'ModSpeedCv',
  'ModShapeCv',
  'ModDepthCv',

  'TunedMode',
  'DiffuseInput',
];

const paramDefaults = {
  Dry: 1,
  Wet: 0.5,
  PreDelay: 0,
  Size: 0.5,
  Diffusion: 1,
  Decay: 0.5,
  InputHighDamp: 1,
  InputLowDamp: 1,
  ReverbHighDamp: 1,
  ReverbLowDamp: 1,
};

const paramIndexes = {};
paramNames.forEach((name, i) => {
  paramIndexes[name] = i;
});

export default class PlatverbNode extends WAMController {
  constructor(actx, options) {
    options = options || {};
    options.numberOfInputs = 1;
    options.numberOfOutputs = 1;
    options.inputChannelCount = [2];
    options.outputChannelCount = [2];

    super(actx, 'Platverb', options);
  }

  setNamedParam(name, value) {
    this.setParam(paramIndexes[name], value);
  }
  static getParamDefaults() {
    return paramDefaults;
  }

  static load(actx) {
    return actx.audioWorklet.addModule('wasm/compiled/PlatverbModule.js');
  }
}
