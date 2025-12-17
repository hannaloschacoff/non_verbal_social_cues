#include "RadarSensor.h"

// https://github.com/Gjorgjevikj/Ai-Thinker-RD-03/blob/main/src/Ai-Thinker-RD-03.h
uint8_t Single_Target_Detection_CMD[12] = {0xFD, 0xFC, 0xFB, 0xFA, 0x02, 0x00, 0x80, 0x00, 0x04, 0x03, 0x02, 0x01};
uint8_t Multi_Target_Detection_CMD[12] = {0xFD, 0xFC, 0xFB, 0xFA, 0x02, 0x00, 0x90, 0x00, 0x04, 0x03, 0x02, 0x01};

void RadarSensor::begin(uint8_t rxPin, uint8_t txPin, unsigned long baud) {
  Serial1.begin(baud, SERIAL_8N1, rxPin, txPin);
  Serial1.setRxBufferSize(RADAR_BUFFER_SIZE);

  Serial1.write(Multi_Target_Detection_CMD, sizeof(Multi_Target_Detection_CMD));
}

bool RadarSensor::update() {
  bool ret = false;
  static uint8_t buffer[RADAR_BUFFER_SIZE];
  static size_t index = 0;
  static enum {WAIT_AA, WAIT_FF, WAIT_03, WAIT_00, RECEIVE_FRAME} state = WAIT_AA;

  while (Serial1.available()) {
    byte byteIn = Serial1.read();

    switch(state) {
      case WAIT_AA:
        if(byteIn == 0xAA) state = WAIT_FF;
        break;

      case WAIT_FF:
        if(byteIn == 0xFF) state = WAIT_03;
        else state = WAIT_AA;
        break;

      case WAIT_03:
        if(byteIn == 0x03) state = WAIT_00;
        else state = WAIT_AA;
        break;

      case WAIT_00:
        if(byteIn == 0x00) {
          index = 0;
          state = RECEIVE_FRAME;
        } else state = WAIT_AA;
        break;

      case RECEIVE_FRAME:
        buffer[index++] = byteIn;
        if(index >= 26) { // 24 bytes data + 2 tail bytes
          if(buffer[24] == 0x55 && buffer[25] == 0xCC) {
            memcpy(_buffer, buffer, RADAR_BUFFER_SIZE);

            ret = true;
          }
          state = WAIT_AA;
          index = 0;
        }
        break;
    }
  }

  return ret;
}

RadarTarget RadarSensor::getTarget(const uint8_t id) {
  uint8_t* buf = _buffer + (id * 8);

  RadarTarget target;

  // only parse first 8 bytes for the first target
  int16_t raw_x = buf[0] | (buf[1] << 8);
  int16_t raw_y = buf[2] | (buf[3] << 8);
  int16_t raw_speed = buf[4] | (buf[5] << 8);
  uint16_t raw_pixel_dist = buf[6] | (buf[7] << 8);

  target.detected = !(raw_x == 0 && raw_y == 0 && raw_speed == 0 && raw_pixel_dist == 0);

  // correctly parse signed valuss
  target.x = ((raw_x & 0x8000) ? 1 : -1) * (raw_x & 0x7FFF);
  target.y = ((raw_y & 0x8000) ? 1 : -1) * (raw_y & 0x7FFF);
  target.speed = ((raw_speed & 0x8000) ? 1 : -1) * (raw_speed & 0x7FFF);

  if (target.detected) {
    target.distance = sqrt(target.x * target.x + target.y * target.y);
    
    // angle calculation (convert radians to degrees, then flip)
    float angleRad = atan2(target.y, target.x) - (PI / 2);
    float angleDeg = angleRad * (180.0 / PI);
    target.angle = -angleDeg; // align angle with x measurement positive / negative sign
  } else {
    target.distance = 0.0;
    target.angle = 0.0;
  }
  
  return target;
}
