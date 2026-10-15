# AI-Driven Text-to-Braille Refreshable Tactile Display — Hardware Simulator

An interactive hardware-in-the-loop (HIL) engineering demonstration console that converts on-screen or typed text into physical 6-dot Braille patterns using six independently controlled pins and miniature push-pull solenoids.

## 1. End-to-End Pipeline Demonstrated

```text
Screen Text / Input → Text Extraction (OCR) → Text Normalisation → Grade 1 Braille Translation
  → Six-Bit Dot Patterns [d1 d2 d3 d4 d5 d6] → Solenoid Driver Signals → Physical Pin Movement Simulation
```

## 2. Project Directory Structure

```text
ai-braille-tactile-simulator/
├── README.md                                          # Architecture, controls & ESP32 hardware wiring guide
├── index.html                                         # Self-contained runnable browser application
├── package.json                                       # Vite + React + TypeScript dependencies
├── tsconfig.json                                      # TypeScript configuration
├── vite.config.ts                                     # Vite bundler configuration
├── src/
│   ├── types/
│   │   └── braille.ts                                 # SixBitPattern, BrailleCell & IBrailleTranslator interfaces
│   ├── translators/
│   │   └── Grade1BrailleTranslator.ts                 # Grade 1 Braille engine (extensible for Liblouis)
│   └── adapters/
│       └── HardwareAdapter.ts                         # SimulationAdapter & ESP32 HardwareAdapter placeholder
└── firmware/
    └── esp32_braille_driver/
        └── esp32_braille_driver.ino                   # ESP32 UART-to-74HC595 solenoid driver firmware
```

## 3. Installation & Startup Commands

### Option A — Instant Browser Launch (Zero Dependencies)
Open `index.html` (or `ai_braille_hardware_simulator.html`) directly in any modern desktop browser (Chrome, Edge, Firefox, Safari).

### Option B — Local Vite Development Server
```bash
npm install
npm run dev
```

## 4. Controls & Operating Guide

1. **Panel A — Text Acquisition**:
   - **Method 1 (Type or Paste)**: Enter any text (e.g., `HELLO WORLD`), optionally toggle explicit Capital (`⠠`) and Number (`⠼`) prefix cells, and click **Process Text Pipeline**.
   - **Method 2 (Extract Screen Text / OCR)**: Click **Capture Screen Text** to invoke `navigator.mediaDevices.getDisplayMedia()`, or upload a screenshot / click **Load Test Screen Frame**. If browser permissions or offline constraints block live OCR, the simulator displays an honest fallback notice and never fabricates fake OCR output.
   - **Method 3 (Load Sample)**: One-click loading of calibrated engineering and accessibility sample sentences.
2. **7-Stage Processing Pipeline**:
   - Animates sequentially from `INPUT RECEIVED` through `ACTUATOR MOVEMENT`. Click any stage card to inspect its exact input and output data.
3. **3D Tactile Display Simulator (Centrepiece)**:
   - Displays the 2×3 Braille cell (`Dots 1–3` left column, `Dots 4–6` right column).
   - Raised pins animate upward with cylindrical 3D depth, specular highlights, and `ON` indicators.
   - Use **◀ Prev**, **▶ Play Sequence / ⏸ Pause**, **Next ▶**, **Speed Selector**, or **Reset All Pins**, or click any individual pin or translated cell in the bottom sequence strip.
4. **Solenoid Driver Monitor**:
   - Displays all 6 push-pull solenoid channels (`DRV-CH1` to `DRV-CH6`), command states (`ON`/`OFF`), coil energisation (`ENERGISED`/`DE-ENERGISED`), and spring-return plunger state (`RAISED`/`LOWERED`).

## 5. Connecting an ESP32 and Six Physical Push-Pull Solenoids

### Electrical Rules & Protection
- **Never drive solenoids directly from ESP32 GPIO pins or 74HC595 shift register outputs.** ESP32 GPIOs are 3.3V logic signals rated for tens of milliamps, whereas miniature push-pull solenoids draw hundreds of milliamps to over 1 A per coil.
- **Shift Register Stage (`74HC595`)**: Expands 3 ESP32 pins (`GPIO 23 SER`, `GPIO 18 SRCLK`, `GPIO 5 RCLK`) into 6 parallel gate-drive signals (`Q0–Q5`).
- **MOSFET Driver Stage**: Each shift register output drives the gate of a logic-level N-channel MOSFET (e.g., IRLZ44N, AO3400, or IRLB8721) through a `220 Ω` series gate resistor with a `10 kΩ` pull-down resistor to GND.
- **Flyback Protection Diodes**: Connect a reverse-biased diode (`1N4007` or `1N5819` Schottky) across every solenoid coil (cathode to `+V_SOL`, anode to MOSFET drain) to clamp inductive voltage spikes when de-energising.
- **Dedicated Solenoid Power Supply**: Power the solenoid positive rail (`+V_SOL`) from a regulated external DC power supply rated for all 6 coils simultaneously, sharing a common star ground (`GND`) with the ESP32.
