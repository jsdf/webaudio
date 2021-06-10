#pragma once
#include <complex>
#include <algorithm> // for std::min, max

 
inline int clamp(int x, int a, int b) {
  return std::max(std::min(x, b), a);
}
 
inline float clamp(float x, float a, float b) {
  return std::fmax(std::fmin(x, b), a);
}  

inline float rescale(float x, float xMin, float xMax, float yMin, float yMax) {
  return yMin + (x - xMin) / (xMax - xMin) * (yMax - yMin);
} 