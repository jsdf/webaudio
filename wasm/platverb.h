 
#include "valley/Plateau.hpp"

#include "processor.h" 

class Platverb : public WAM::Processor
{
public:
  virtual const char* init(uint32_t bufsize, uint32_t sr, void* desc);
  virtual void terminate();
  virtual void resize(uint32_t bufsize);
  virtual void onProcess(WAM::AudioBus* audio, void* data);
  virtual void onMidi(WAM::byte status, WAM::byte data1, WAM::byte data2);
  virtual void onSysex(WAM::byte* msg, uint32_t size);
  virtual void onPatch(void* patch, uint32_t size);
  virtual void onParam(uint32_t idparam, double value);
private:
  Plateau * plateau_;
  uint32_t bufsize_;
};
 