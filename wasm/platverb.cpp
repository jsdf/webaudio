 
#include "platverb.h"

extern "C" { EMSCRIPTEN_KEEPALIVE void* createModule() { return new Platverb(); } }

const char* Platverb::init(uint32_t bufsize, uint32_t sr, void* desc)
{
  // init here
  bufsize_ = bufsize; 
  
  plateau_ = new Plateau(sr);
  plateau_->inputs[Plateau::LEFT_INPUT].connected = true;
  plateau_->inputs[Plateau::RIGHT_INPUT].connected = true;
  plateau_->outputs[Plateau::LEFT_OUTPUT].connected = true;
  plateau_->outputs[Plateau::RIGHT_OUTPUT].connected = true;
  return 0;
}

void Platverb::terminate()
{
  delete plateau_;
}

void Platverb::resize(uint32_t bufsize)
{ 
  bufsize_ = bufsize;
}

void Platverb::onMidi(WAM::byte status, WAM::byte data1, WAM::byte data2)
{
  // uint8_t msg[3] = { status, data1, data2 };
  // ring_buffer_.Write(msg, 3);
}

void Platverb::onSysex(WAM::byte* msg, uint32_t size)
{
  // if (size == 4104)
  //   ring_buffer_.Write(msg, 4104);
}

void Platverb::onPatch(void* patch, uint32_t size)
{
  // synth_unit_->onPatch((WAM::byte*)patch, size);
}

void Platverb::onParam(uint32_t idparam, double value)
{
  if (idparam>=Plateau::NUM_PARAMS) {
    return;
  }

  plateau_->params[idparam].setValueNorm(
    value 
  ); 
}

#define CHANNELS 2

void Platverb::onProcess(WAM::AudioBus* audio, void* data)
{
  for (int i = 0; i < bufsize_; i++) {
    for (int ch = 0; ch < CHANNELS; ++ch) {
      float* inbuf = audio->inputs[ch];

      plateau_->inputs[ch == 0 ? Plateau::LEFT_INPUT : Plateau::RIGHT_INPUT].setVoltage(inbuf[i] * 5.f);
    }

    plateau_->process();

    for (int ch = 0; ch < CHANNELS; ++ch) {
      float* outbuf = audio->outputs[ch];
      outbuf[i] = plateau_->outputs[ch == 0 ? Plateau::LEFT_OUTPUT : Plateau::RIGHT_OUTPUT].getVoltage() / 5.f; 
    }
  }
}