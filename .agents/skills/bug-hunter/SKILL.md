---
name: bug-hunter
description: Autonomous bug, error, and hardware safety diagnostic agent for the Text-to-Braille Refreshable Tactile Simulator. Use whenever the user asks to check for bugs, diagnose errors, test translation fidelity, audit solenoid safety duty cycles, or troubleshoot the application.
---

# Bug Hunter & QA Sentry Agent

This agent inspects, audits, and diagnoses bugs and hardware safety issues across the Text-to-Braille Refreshable Tactile Display simulator.

## Core Responsibilities

1. **JavaScript & DOM Integrity**:
   - Verify all inline script blocks evaluate cleanly without syntax errors.
   - Audit all `document.getElementById` calls to ensure they match live DOM elements.
2. **Braille Translation Accuracy**:
   - Check Grade 1 and Grade 2 Braille translation tables against standard ground truth.
   - Verify number prefixes (`#` indicator `[3, 4, 5, 6]`), capitalization prefixes (`[6]`), and punctuation.
3. **Hardware Safety & Solenoid Protection**:
   - Validate duty-cycle limits (preventing continuous >20% coil energization without PWM drop).
   - Ensure thermal monitoring thresholds (warn at 65°C, emergency cutoff at 85°C).
   - Verify peak current limits across the 6-channel solenoid driver.
4. **Web Serial Communication**:
   - Verify 115200 8N1 UART configuration and packet framing with newline delimiters (`\n`).

## How to Run the Automated System Audit

Run the automated diagnostic suite via PowerShell/Node:

```powershell
node e:\Nawhh\Text-to-Braille\.agents\skills\bug-hunter\scripts\audit-bugs.js
```

## Remediation Playbooks

### 1. Missing DOM ID or Null Reference
- Locate the missing ID reported in the audit.
- Inspect [index.html](file:///e:/Nawhh/Text-to-Braille/ai-braille-tactile-simulator/index.html).
- If the element was renamed, update the corresponding `getElementById` call or restore the ID on the target tag.

### 2. Solenoid Overheating / Duty Cycle Anomaly
- Check pulse duration settings in the driver (`PULSE_DURATION_MS`).
- Ensure hold PWM drops to ~30% power after initial 30ms pull-in to prevent coil burnout.

### 3. Braille Mapping Discrepancy
- Verify against the official English Braille American Edition Grade 1 chart.
- Ensure dots are 1-indexed (Dot 1 = Top-Left, Dot 2 = Mid-Left, Dot 3 = Bot-Left, Dot 4 = Top-Right, Dot 5 = Mid-Right, Dot 6 = Bot-Right).
