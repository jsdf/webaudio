//
// Plateu.hpp
// Author: Dale Johnson
// Contact: valley.audio.soft@gmail.com
// Date: 24/6/2018
//
// Copyright 2018 Dale Johnson. Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met: 1. Redistributions of
// source code must retain the above copyright notice, this list of conditions and the following
// disclaimer. 2. Redistributions in binary form must reproduce the above copyright notice, this
// list of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution. 3. Neither the name of the copyright holder nor the names of its
// contributors may be used to endorse or promote products derived from this software without
// specific prior written permission.THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
// CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
// THE POSSIBILITY OF SUCH DAMAGE.
//
// Plateau is based on the venerable Dattorro (1997) reverb algorithm.
// Reference: Dattorro, J. (1997). Effect design part 1: Reverberator and other filters, J. Audio
// Eng. Soc, 45(9), 660-684.

#ifndef DSJ_PLATEAU_HPP
#define DSJ_PLATEAU_HPP

#include "Dattorro.hpp"
#include "NonLinear.hpp"
#include "LinearEnvelope.hpp"
#include <vector>
#include "rmath.hpp"



class Param {
public:
    int id;
    float min;
    float max;
    float defaultVal;
    float value;
    std::string name;

    float getValue();
    void setValue(float value);
    void setValueNorm(float value);
    Param();
    Param(
        int id,
        float min,
        float max,
        float defaultVal,
        std::string name
    );
    void init(
        int id,
        float min,
        float max,
        float defaultVal,
        std::string name
    );
}; 

class Port {
public:
    float value = 0.0;
    bool connected = false;

    void setVoltage(float value);
    float getVoltage();
    float getVoltageSum();
    bool isConnected();
    Port();
};

class Light {
public:
    float value = 0.0;

    float setBrightness(float value);
    Light();
};


class Plateau {
public:

    enum InputIds {
        LEFT_INPUT,
        RIGHT_INPUT,

        DRY_CV_INPUT,
        WET_CV_INPUT,
        PRE_DELAY_CV_INPUT,
        INPUT_LOW_DAMP_CV_INPUT,
        INPUT_HIGH_DAMP_CV_INPUT,

        SIZE_CV_INPUT,
        DIFFUSION_CV_INPUT,
        DECAY_CV_INPUT,
        REVERB_HIGH_DAMP_CV_INPUT,
        REVERB_LOW_DAMP_CV_INPUT,

        MOD_SPEED_CV_INPUT,
        MOD_SHAPE_CV_INPUT,
        MOD_DEPTH_CV_INPUT,

        FREEZE_CV_INPUT,
        CLEAR_CV_INPUT,

        NUM_INPUTS
    };

    enum OutputIds {
        LEFT_OUTPUT,
        RIGHT_OUTPUT,
        NUM_OUTPUTS
    };

    enum ParamIds {
        DRY_PARAM,
        WET_PARAM,
        PRE_DELAY_PARAM,
        INPUT_LOW_DAMP_PARAM,
        INPUT_HIGH_DAMP_PARAM,

        SIZE_PARAM,
        DIFFUSION_PARAM,
        DECAY_PARAM,
        REVERB_HIGH_DAMP_PARAM,
        REVERB_LOW_DAMP_PARAM,

        MOD_SPEED_PARAM,
        MOD_SHAPE_PARAM,
        MOD_DEPTH_PARAM,

        FREEZE_PARAM,
        CLEAR_PARAM,
        FREEZE_TOGGLE_PARAM,
        CLEAR_TOGGLE_PARAM,

        DRY_CV_PARAM,
        WET_CV_PARAM,
        INPUT_LOW_DAMP_CV_PARAM,
        INPUT_HIGH_DAMP_CV_PARAM,

        SIZE_CV_PARAM,
        DIFFUSION_CV_PARAM,
        DECAY_CV_PARAM,
        REVERB_HIGH_DAMP_CV_PARAM,
        REVERB_LOW_DAMP_CV_PARAM,

        MOD_SPEED_CV_PARAM,
        MOD_SHAPE_CV_PARAM,
        MOD_DEPTH_CV_PARAM,

        TUNED_MODE_PARAM,
        DIFFUSE_INPUT_PARAM,

        NUM_PARAMS
    };



    enum LightIds {
        FREEZE_LIGHT,
        CLEAR_LIGHT,
        FREEZE_TOGGLE_LIGHT,
        TUNED_MODE_LIGHT,
        DIFFUSE_INPUT_LIGHT,
        NUM_LIGHTS
    };

    // CV scaling
    const float dryMin = 0.f;
    const float dryMax = 1.f;
    const float wetMin = 0.f;
    const float wetMax = 1.f;
    const float preDelayNormSens = 0.1f;
    const float preDelayLowSens = 0.05f;
    const float sizeMin = 0.0025f;
    const float sizeMax = 4.0f;
    const float diffMin = 0.f;
    const float diffMax = 1.f;
    const float decayMin = 0.1f;
    const float decayMax = 0.9999f;
    const float reverbLowDampMin = 0.f;
    const float reverbLowDampMax = 10.f;
    const float reverbHighDampMin = 0.f;
    const float reverbHIghDampMax = 10.f;
    const float modSpeedMin = 0.f;
    const float modSpeedMax = 1.f;
    const float modDepthMin = 0.f;
    const float modDepthMax = 16.f;
    const float modShapeMin = 0.001f;
    const float modShapeMax = 0.999f;

    float wet;
    float dry;
    float preDelay;
    float preDelayCVSens;
    float size;
    float diffusion;
    float decay;
    float inputSensitivity;
    float inputDampLow;
    float inputDampHigh;
    float reverbDampLow;
    float reverbDampHigh;
    float modSpeed;
    float modShape;
    float modDepth;

    bool freezeButtonState;
    bool freezeToggle;
    bool freezeToggleButtonState;
    bool freeze;
    bool frozen;
    bool tunedButtonState;
    bool diffuseButtonState;
    int preDelayCVSensState;
    int inputSensitivityState;
    int outputSaturationState;

    bool clear;
    bool cleared;
    bool fadeOut, fadeIn;

    float leftInput, rightInput;
    float leftOutput, rightOutput;
    Dattorro reverb;
    LinearEnvelope envelope;

    int panelStyle = 0;
    int tuned;
    int diffuseInput;

    bool printy = true;
    int printLength = 512;
    int printCount = 0;

    std::vector<Param> params;
    Port inputs[NUM_INPUTS];
    Port outputs[NUM_OUTPUTS];
    Light lights[NUM_LIGHTS];

    Plateau(double sampleRate);
    void process();
    void onSampleRateChange(double sampleRate); 

};

extern const char *PlateauParamIdStrings[];

#endif
