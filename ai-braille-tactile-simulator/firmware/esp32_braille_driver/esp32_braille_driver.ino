// firmware/esp32_braille_driver/esp32_braille_driver.ino
// ESP32 Firmware for AI-Driven Text-to-Braille Refreshable Tactile Display
// Drives 74HC595 Shift Register -> 6-Channel Logic-Level MOSFET Stage -> 6 Push-Pull Solenoids

#include <Arduino.h>

constexpr int PIN_SER   = 23; // 74HC595 DS (Serial Data Input)
constexpr int PIN_SRCLK = 18; // 74HC595 SHCP (Shift Clock)
constexpr int PIN_RCLK  = 5;  // 74HC595 STCP (Latch Clock)
constexpr int PIN_OE    = 4;  // 74HC595 Output Enable (Active LOW)

void setBrailleSolenoids(uint8_t bitMask) {
  digitalWrite(PIN_RCLK, LOW);
  shiftOut(PIN_SER, PIN_SRCLK, MSBFIRST, bitMask & 0x3F);
  digitalWrite(PIN_RCLK, HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_SER, OUTPUT);
  pinMode(PIN_SRCLK, OUTPUT);
  pinMode(PIN_RCLK, OUTPUT);
  pinMode(PIN_OE, OUTPUT);

  setBrailleSolenoids(0x00); // Ensure all solenoids start de-energised
  digitalWrite(PIN_OE, LOW);
  Serial.println("{\"status\":\"ESP32_BRAILLE_DRIVER_READY\"}");
}

void loop() {
  if (Serial.available() > 0) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() == 6) {
      uint8_t mask = 0;
      for (int i = 0; i < 6; i++) {
        if (line.charAt(i) == '1') {
          mask |= (1 << i); // Dot (i+1)
        }
      }
      setBrailleSolenoids(mask);
      Serial.printf("{\"ack\":\"%s\",\"mask\":%u}\n", line.c_str(), mask);
    }
  }
}
