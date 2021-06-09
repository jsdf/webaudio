#include "Plateau.hpp"

Param::Param() {
    id = 0;
    min = 0.f;
    max = 1.f;
    defaultVal = 0.f;
    value = 0.f;
    name = "";
}
 
Param::Param(
    int id,
    float min,
    float max,
    float defaultVal,
    std::string name
) : id(id), min(min), max(max), defaultVal(defaultVal),  value(defaultVal), name(name) {
 
};

void Param::init(
    int id,
    float min,
    float max,
    float defaultVal,
    std::string name
) {
    this->id = id;
    this->min = min;
    this->max = max;
    this->defaultVal = defaultVal;
    this->name = name;
    this->value = defaultVal;
}

 
void Param::setValue(float value) {
    this->value = value;
}
void Param::setValueNorm(float valueNorm) {
    this->value = valueNorm * (max - min) + min;
}
 
float Param::getValue() {
    return value;
}
 

void Port::setVoltage(float value) {
    this->value = value;
}
float Port::getVoltage() {
    return value;
}
float Port::getVoltageSum() {
    return value;
}
bool Port::isConnected() {
    return connected;
}

Port::Port() {    
}

Light::Light() {
    
}

Plateau::Plateau(double sampleRate) {

    for (std::size_t i = 0; i < NUM_PARAMS; ++i)
    {
        params.push_back(Param());
    }
    params[DRY_PARAM].init(DRY_PARAM, 0.0f, 1.f, 1.f, "Dry Level");
    params[WET_PARAM].init(WET_PARAM, 0.0f, 1.f, 0.5f, "Wet Level");
    params[PRE_DELAY_PARAM].init(PRE_DELAY_PARAM, 0.f, 0.500f, 0.f, "Pre-delay");
    params[INPUT_LOW_DAMP_PARAM].init(INPUT_LOW_DAMP_PARAM, 0.f, 10.f, 10.f, "Input Low Cut");
    params[INPUT_HIGH_DAMP_PARAM].init(INPUT_HIGH_DAMP_PARAM, 0.f, 10.f, 10.f, "Input High Cut");
    params[SIZE_PARAM].init(SIZE_PARAM, 0.f, 1.f, 0.5f, "Size");
    params[DIFFUSION_PARAM].init(DIFFUSION_PARAM, 0.f, 10.f, 10.f, "Diffusion");
    params[DECAY_PARAM].init(DECAY_PARAM, 0.1f, 0.9999f, 0.54995f, "Decay");
    params[REVERB_LOW_DAMP_PARAM].init(REVERB_LOW_DAMP_PARAM, 0.0f, 10.f, 10.f, "Reverb Low Cut");
    params[REVERB_HIGH_DAMP_PARAM].init(REVERB_HIGH_DAMP_PARAM, 0.0f, 10.f, 10.f, "Reverb High Cut");
    params[MOD_SPEED_PARAM].init(MOD_SPEED_PARAM, 0.f, 1.f, 0.f, "Modulation Rate");
    params[MOD_DEPTH_PARAM].init(MOD_DEPTH_PARAM, 0.f, 16.f, 0.5f, "Modulation Depth");
    params[MOD_SHAPE_PARAM].init(MOD_SHAPE_PARAM, 0.f, 1.f, 0.5f, "Modulation Shape");


    params[DRY_CV_PARAM].init(DRY_CV_PARAM, -1.f, 1.f, 0.f, "Dry CV Depth");
    params[WET_CV_PARAM].init(WET_CV_PARAM, -1.f, 1.f, 0.f, "Wet CV Depth");
    params[INPUT_LOW_DAMP_CV_PARAM].init(INPUT_LOW_DAMP_CV_PARAM, -1.f, 1.f, 0.f, "Input Low Cut CV");
    params[INPUT_HIGH_DAMP_CV_PARAM].init(INPUT_HIGH_DAMP_CV_PARAM, -1.f, 1.f, 0.f, "Input High Cut CV");
    params[SIZE_CV_PARAM].init(SIZE_CV_PARAM, -1.f, 1.f, 0.f, "Size CV");
    params[DIFFUSION_CV_PARAM].init(DIFFUSION_CV_PARAM, -1.f, 1.f, 0.f, "Diffusion CV");
    params[DECAY_CV_PARAM].init(DECAY_CV_PARAM, -1.f, 1.f, 0.f, "Decay CV");
    params[REVERB_LOW_DAMP_CV_PARAM].init(REVERB_LOW_DAMP_CV_PARAM, -1.f, 1.f, 0.f, "Reverb Low Cut CV");
    params[REVERB_HIGH_DAMP_CV_PARAM].init(REVERB_HIGH_DAMP_CV_PARAM, -1.f, 1.f, 0.f, "Reverb High Cut CV");
    params[MOD_SPEED_CV_PARAM].init(MOD_SPEED_CV_PARAM, -1.f, 1.f, 0.f, "Mod Speed CV");
    params[MOD_SHAPE_CV_PARAM].init(MOD_SHAPE_CV_PARAM, -1.f, 1.f, 0.f, "Mod Shape CV");
    params[MOD_DEPTH_CV_PARAM].init(MOD_DEPTH_CV_PARAM, -1.f, 1.f, 0.f, "Mod Depth CV");
    params[FREEZE_PARAM].init(FREEZE_PARAM, 0.f, 1.f, 0.f, "Freeze");
    params[FREEZE_TOGGLE_PARAM].init(FREEZE_TOGGLE_PARAM, 0.f, 1.f, 0.f, "Freeze Toggle");
    params[CLEAR_PARAM].init(CLEAR_PARAM, 0.f, 1.f, 0.f, "Clear");
    params[TUNED_MODE_PARAM].init(TUNED_MODE_PARAM, 0.f, 1.f, 0.f, "Tuned Mode");
    params[DIFFUSE_INPUT_PARAM].init(DIFFUSE_INPUT_PARAM, 0.f, 1.f, 1.f, "Diffuse Input");

    reverb.setSampleRate(sampleRate);
    envelope.setSampleRate(sampleRate);
    envelope.setTime(0.004f);
    envelope._value = 1.f;

    wet = 0.5f;
    dry = 1.f;
    preDelay = 0.f;
    preDelayCVSens = preDelayNormSens;
    size = 1.f;
    diffusion = 1.f;
    decay = 0.f;
    inputDampLow = 0.f;
    inputDampHigh = 10.f;
    reverbDampLow = 0.f;
    reverbDampHigh = 10.f;
    modSpeed = 0.1f;
    modShape = 0.5f;
    modDepth = 0.0f;

    freezeButtonState = false;
    freezeToggle = false;
    freezeToggleButtonState = false;
    freeze = false;
    frozen = false;
    tunedButtonState = false;
    diffuseButtonState = false;
    preDelayCVSensState = 0;
    inputSensitivityState = 0;
    outputSaturationState = 0;

    clear = false;
    cleared = true;
    fadeOut = false;
    fadeIn = false;
    tuned = 0;
    diffuseInput = 1;

    leftInput = 0.f;
    rightInput = 0.f;
}

void Plateau::process() {
    //Freeze
    freezeToggle = params[FREEZE_TOGGLE_PARAM].getValue() > 0.5f ? true : false;
    lights[FREEZE_TOGGLE_LIGHT].value = freezeToggle ? 10.f : 0.f;

    if((params[FREEZE_PARAM].getValue() > 0.5f || inputs[FREEZE_CV_INPUT].getVoltage() > 0.5f)
    && !freezeButtonState) {
        freeze = freezeToggle ? !freeze : true;
        freezeButtonState = true;
    }
    if(params[FREEZE_PARAM].getValue() <= 0.5f && inputs[FREEZE_CV_INPUT].getVoltage() <= 0.5f
    && freezeButtonState) {
        freeze = freezeToggle ? freeze : false;
        freezeButtonState = false;
    }

    if(freeze && !frozen) {
        frozen = true;
        reverb.freeze();
    }
    else if(!freeze && frozen){
        frozen = false;
        reverb.unFreeze();
    }
    lights[FREEZE_LIGHT].value = freeze ? 10.f : 0.f;

    tuned = params[TUNED_MODE_PARAM].getValue() > 0.5f ? 1 : 0;
    lights[TUNED_MODE_LIGHT].value = tuned ? 10.f : 0.f;

    diffuseInput = params[DIFFUSE_INPUT_PARAM].getValue();
    lights[DIFFUSE_INPUT_LIGHT].value = diffuseInput ? 10.f : 0.f;

    // Clear
    if((params[CLEAR_PARAM].getValue() > 0.5f || inputs[CLEAR_CV_INPUT].getVoltage() > 0.5f) && !clear && cleared) {
        cleared = false;
        clear = true;
        //clear = 1;
    }
    else if((params[CLEAR_PARAM].getValue() < 0.5f && inputs[CLEAR_CV_INPUT].getVoltage() < 0.5f) && cleared) {
        clear = false;
    }

    if(clear) {
        if(!cleared && !fadeOut && !fadeIn) {
            fadeOut = true;
            envelope.setStartEndPoints(1.f, 0.f);
            envelope.trigger();
            lights[CLEAR_LIGHT].value = 10.f;
        }
        if(fadeOut && envelope._justFinished) {
            reverb.clear();
            fadeOut = false;
            fadeIn = true;
            envelope.setStartEndPoints(0.f, 1.f);
            envelope.trigger();
        }
        if(fadeIn && envelope._justFinished) {
            fadeIn = false;
            cleared = true;
            lights[CLEAR_LIGHT].value = 0.f;
            envelope._value = 1.f;
        }
    }
    envelope.process();

    // CV
    switch(preDelayCVSensState) {
        case 0: preDelayCVSens = preDelayNormSens; break;
        case 1: preDelayCVSens = preDelayLowSens;
    }
    preDelay = params[PRE_DELAY_PARAM].getValue();
    preDelay += 0.5f * (powf(2.f, inputs[PRE_DELAY_CV_INPUT].getVoltage() * preDelayCVSens) - 1.f);
    reverb.setPreDelay(clamp(preDelay, 0.f, 1.f));

    size = inputs[SIZE_CV_INPUT].getVoltage() * params[SIZE_CV_PARAM].getValue() * 0.1f;
    size += params[SIZE_PARAM].getValue();
    if(tuned) {
        size = sizeMin * powf(2.f, size * 5.f);
        size = clamp(size, sizeMin, 2.5f);
    }
    else {
        size *= size;
        size = rescale(size, 0.f, 1.f, 0.01f, sizeMax);
        size = clamp(size, 0.01f, sizeMax);
    }
    reverb.setTimeScale(size);

    diffusion = inputs[DIFFUSION_CV_INPUT].getVoltage() * params[DIFFUSION_CV_PARAM].getValue();
    diffusion += params[DIFFUSION_PARAM].getValue();
    diffusion = clamp(diffusion, 0.f, 10.f);
    reverb.plateDiffusion1 = rescale(diffusion, 0.f, 10.f, 0.f, 0.7f);
    reverb.plateDiffusion2 = rescale(diffusion, 0.f, 10.f, 0.f, 0.5f);

    decay = rescale(inputs[DECAY_CV_INPUT].getVoltage() * params[DECAY_CV_PARAM].getValue(), 0.f, 10.f, 0.1f, 0.999f);
    decay += params[DECAY_PARAM].getValue();
    decay = clamp(decay, 0.1f, decayMax);
    decay = 1.f - decay;
    decay = 1.f - decay * decay;

    inputDampLow = inputs[INPUT_LOW_DAMP_CV_INPUT].getVoltage() * params[INPUT_LOW_DAMP_CV_PARAM].getValue();
    inputDampLow += params[INPUT_LOW_DAMP_PARAM].value;
    inputDampLow = clamp(inputDampLow, 0.f, 10.f);
    inputDampLow = 10.f - inputDampLow;

    inputDampHigh = inputs[INPUT_HIGH_DAMP_CV_INPUT].getVoltage() * params[INPUT_HIGH_DAMP_CV_PARAM].getValue();
    inputDampHigh += params[INPUT_HIGH_DAMP_PARAM].getValue();
    inputDampHigh = clamp(inputDampHigh, 0.f, 10.f);

    reverbDampLow = inputs[REVERB_LOW_DAMP_CV_INPUT].getVoltage() * params[REVERB_LOW_DAMP_CV_PARAM].getValue();
    reverbDampLow += params[REVERB_LOW_DAMP_PARAM].getValue();
    reverbDampLow = clamp(reverbDampLow, 0.f, 10.f);
    reverbDampLow = 10.f - reverbDampLow;

    reverbDampHigh = inputs[REVERB_HIGH_DAMP_CV_INPUT].getVoltage() * params[REVERB_HIGH_DAMP_CV_PARAM].getValue();
    reverbDampHigh += params[REVERB_HIGH_DAMP_PARAM].getValue();
    reverbDampHigh = clamp(reverbDampHigh, 0.f, 10.f);

    reverb.diffuseInput = (double)diffuseInput;

    reverb.decay = decay;
    reverb.inputLowCut = 440.f * powf(2.f, inputDampLow - 5.f);
    reverb.inputHighCut = 440.f * powf(2.f, inputDampHigh - 5.f);
    reverb.reverbLowCut = 440.f * powf(2.f, reverbDampLow - 5.f);
    reverb.reverbHighCut = 440.f * powf(2.f, reverbDampHigh - 5.f);

    modSpeed = inputs[MOD_SPEED_CV_INPUT].getVoltage() * params[MOD_SPEED_CV_PARAM].getValue() * 0.1f;
    modSpeed += params[MOD_SPEED_PARAM].getValue();
    modSpeed = clamp(modSpeed, modSpeedMin, modSpeedMax);
    modSpeed *= modSpeed;
    modSpeed = modSpeed * 99.f + 1.f;

    modShape = inputs[MOD_SHAPE_CV_INPUT].getVoltage() * params[MOD_SHAPE_CV_PARAM].getValue() * 0.1f;
    modShape += params[MOD_SHAPE_PARAM].getValue();
    modShape = rescale(modShape, 0.f, 1.f, modShapeMin, modShapeMax);
    modShape = clamp(modShape, modShapeMin, modShapeMax);

    modDepth = inputs[MOD_DEPTH_CV_INPUT].getVoltage() * params[MOD_DEPTH_CV_PARAM].getValue();
    modDepth = rescale(modDepth, 0.f, 10.f, modDepthMin, modDepthMax);
    modDepth += params[MOD_DEPTH_PARAM].getValue();
    modDepth = clamp(modDepth, modDepthMin, modDepthMax);

    reverb.modSpeed = modSpeed;
    reverb.modDepth = modDepth;
    reverb.setModShape(modShape);

    leftInput = inputs[LEFT_INPUT].getVoltageSum();
    rightInput = inputs[RIGHT_INPUT].getVoltageSum();
    if(inputs[LEFT_INPUT].isConnected() == false && inputs[RIGHT_INPUT].isConnected() == true) {
        leftInput = inputs[RIGHT_INPUT].getVoltageSum();
    }
    else if(inputs[LEFT_INPUT].isConnected() == true && inputs[RIGHT_INPUT].isConnected() == false) {
        rightInput = inputs[LEFT_INPUT].getVoltageSum();
    }
    leftInput = clamp(leftInput, -10.f, 10.f);
    rightInput = clamp(rightInput, -10.f, 10.f);

    inputSensitivity = inputSensitivityState ? 0.125893f : 1.f;
    reverb.process(leftInput * 0.1f * inputSensitivity * envelope._value,
                   rightInput * 0.1f * inputSensitivity * envelope._value);

    dry = inputs[DRY_CV_INPUT].getVoltage() * params[DRY_CV_PARAM].getValue();
    dry += params[DRY_PARAM].getValue();
    dry = clamp(dry, 0.f, 1.f);

    wet = inputs[WET_CV_INPUT].getVoltage() * params[WET_CV_PARAM].getValue();
    wet += params[WET_PARAM].getValue();
    wet = clamp(wet, 0.f, 1.f) * 10.f;

    leftOutput = leftInput * dry + reverb.leftOut * wet * envelope._value;
    rightOutput = rightInput * dry + reverb.rightOut * wet * envelope._value;

    if(outputSaturationState) {
        outputs[LEFT_OUTPUT].setVoltage(tanhDriveSignal(leftOutput * 0.111f, 0.95f) * 9.999f);
        outputs[RIGHT_OUTPUT].setVoltage(tanhDriveSignal(rightOutput * 0.111f, 0.95f) * 9.999f);
    }
    else {
        outputs[LEFT_OUTPUT].setVoltage(clamp(leftOutput, -10.f, 10.f));
        outputs[RIGHT_OUTPUT].setVoltage(clamp(rightOutput, -10.f, 10.f));
    }
}

void Plateau::onSampleRateChange(double sampleRate) {
    reverb.setSampleRate(sampleRate);
    envelope.setSampleRate(sampleRate);
}

const char *PlateauParamIdStrings[] = {
    "DRY_PARAM",
    "WET_PARAM",
    "PRE_DELAY_PARAM",
    "INPUT_LOW_DAMP_PARAM",
    "INPUT_HIGH_DAMP_PARAM",

    "SIZE_PARAM",
    "DIFFUSION_PARAM",
    "DECAY_PARAM",
    "REVERB_HIGH_DAMP_PARAM",
    "REVERB_LOW_DAMP_PARAM",

    "MOD_SPEED_PARAM",
    "MOD_SHAPE_PARAM",
    "MOD_DEPTH_PARAM",

    "FREEZE_PARAM",
    "CLEAR_PARAM",
    "FREEZE_TOGGLE_PARAM",
    "CLEAR_TOGGLE_PARAM",

    "DRY_CV_PARAM",
    "WET_CV_PARAM",
    "INPUT_LOW_DAMP_CV_PARAM",
    "INPUT_HIGH_DAMP_CV_PARAM",

    "SIZE_CV_PARAM",
    "DIFFUSION_CV_PARAM",
    "DECAY_CV_PARAM",
    "REVERB_HIGH_DAMP_CV_PARAM",
    "REVERB_LOW_DAMP_CV_PARAM",

    "MOD_SPEED_CV_PARAM",
    "MOD_SHAPE_CV_PARAM",
    "MOD_DEPTH_CV_PARAM",

    "TUNED_MODE_PARAM",
    "DIFFUSE_INPUT_PARAM",

    "NUM_PARAMS"
};
