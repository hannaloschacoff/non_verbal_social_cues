#pragma once
// remove this line if you're working inside Arduino studio if you're getting errors
// including Arduino manually is only needed for PlatformIO
#include <Arduino.h>

#define RADAR_BUFFER_SIZE 64

typedef struct RadarTarget {
  float distance;  // mm
  float angle;     // radians
  float speed;     // cm/s
  int16_t x;       // mm
  int16_t y;       // mm
  bool detected;
} RadarTarget;

class RadarSensor {
  public:
    void begin(uint8_t rxPin, uint8_t txPin, unsigned long baud = 256000);
    bool update();
    RadarTarget getTarget(uint8_t id = 0); // No index, only first target
  private:
    uint8_t _buffer[RADAR_BUFFER_SIZE] = {0};
};

