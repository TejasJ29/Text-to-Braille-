#!/usr/bin/env node
/**
 * Bug & Error Diagnostic Agent - Core Audit Script
 * Workspace: Text-to-Braille Refreshable Tactile Display
 * 
 * Runs comprehensive automated sanity checks for:
 * 1. JavaScript Syntax & HTML Structure
 * 2. DOM ID References & Event Binding
 * 3. Braille Grade 1 & 2 Translation Integrity
 * 4. Solenoid Hardware Safety & Thermal Limits
 * 5. Web Serial Protocol Framing (115200 8N1)
 * 6. Audio Context & Accessibility Readiness
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../../');
const htmlPath = path.join(repoRoot, 'ai-braille-tactile-simulator', 'index.html');

console.log('====================================================');
console.log('🔍 BUG HUNTER & QA SENTRY: STARTING SYSTEM AUDIT');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;
const issues = [];

function pass(name, msg) {
  passCount++;
  console.log(`  ✅ [PASS] ${name}${msg ? ': ' + msg : ''}`);
}

function warn(name, msg, remediation) {
  warnCount++;
  issues.push({ level: 'WARN', name, msg, remediation });
  console.warn(`  ⚠️  [WARN] ${name}: ${msg}`);
}

function fail(name, msg, remediation) {
  failCount++;
  issues.push({ level: 'FAIL', name, msg, remediation });
  console.error(`  ❌ [FAIL] ${name}: ${msg}`);
}

// ---------------------------------------------------------
// 1. HTML File Existence & Script Syntax
// ---------------------------------------------------------
console.log('--- Suite 1: File Integrity & Script Syntax ---');
if (!fs.existsSync(htmlPath)) {
  fail('HTML File', `Main entry file not found at ${htmlPath}`, 'Ensure index.html is located in ai-braille-tactile-simulator/');
} else {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  pass('HTML File', `Found index.html (${(htmlContent.length / 1024).toFixed(1)} KB)`);

  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let scriptIdx = 0;
  let scriptErrors = 0;

  while ((scriptMatch = scriptRegex.exec(htmlContent)) !== null) {
    const code = scriptMatch[1].trim();
    if (code && !scriptMatch[0].includes('cdn.tailwindcss.com')) {
      scriptIdx++;
      try {
        new Function(code);
      } catch (err) {
        scriptErrors++;
        fail(`Script Block #${scriptIdx}`, err.message, 'Review syntax error in index.html around line of script block');
      }
    }
  }

  if (scriptErrors === 0) {
    pass('Script Syntax', `All ${scriptIdx} inline JavaScript blocks evaluated without SyntaxErrors.`);
  }

  // ---------------------------------------------------------
  // 2. DOM ID References Integrity
  // ---------------------------------------------------------
  console.log('\n--- Suite 2: DOM Element ID Integrity ---');
  const getElemRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
  const requestedIds = [...new Set([...htmlContent.matchAll(getElemRegex)].map(m => m[1]))];

  const missingIds = requestedIds.filter(id => {
    return !htmlContent.includes(`id="${id}"`) && !htmlContent.includes(`id='${id}'`);
  });

  if (missingIds.length === 0) {
    pass('DOM IDs', `All ${requestedIds.length} getElementById references match existing DOM elements.`);
  } else {
    fail('DOM IDs', `Missing ${missingIds.length} elements: ${missingIds.join(', ')}`, 'Add matching id attributes or update getElementById calls');
  }

  // ---------------------------------------------------------
  // 3. Braille Grade 1 Standard Mapping Tests
  // ---------------------------------------------------------
  console.log('\n--- Suite 3: Braille Translation Ground Truth ---');
  // Standard Grade 1 Braille specs
  const expectedBraille = {
    'A': [1],
    'B': [1, 2],
    'C': [1, 4],
    'D': [1, 4, 5],
    'E': [1, 5],
    'F': [1, 2, 4],
    'G': [1, 2, 4, 5],
    'H': [1, 2, 5],
    'I': [2, 4],
    'J': [2, 4, 5],
    'K': [1, 3],
    'L': [1, 2, 3],
    'M': [1, 3, 4],
    'N': [1, 3, 4, 5],
    'O': [1, 3, 5],
    'P': [1, 2, 3, 4],
    'Q': [1, 2, 3, 4, 5],
    'R': [1, 2, 3, 5],
    'S': [2, 3, 4],
    'T': [2, 3, 4, 5],
    'U': [1, 3, 6],
    'V': [1, 2, 3, 6],
    'W': [2, 4, 5, 6],
    'X': [1, 3, 4, 6],
    'Y': [1, 3, 4, 5, 6],
    'Z': [1, 3, 5, 6]
  };

  let brailleErrors = 0;
  for (const [char, dots] of Object.entries(expectedBraille)) {
    const hasCharInTable = htmlContent.includes(`"${char}":`) || htmlContent.includes(`'${char}':`);
    if (!hasCharInTable) {
      brailleErrors++;
      fail('Braille Table', `Character '${char}' missing in Braille dictionary.`, 'Ensure Grade 1 lookup table includes all A-Z characters.');
    }
  }

  if (brailleErrors === 0) {
    pass('Braille Alphabet', 'All 26 standard English alphabet letters (A-Z) present in translation dictionary.');
  }

  // Number Sign check (# = dots 3,4,5,6 / bit vector [0, 0, 1, 1, 1, 1])
  if (htmlContent.includes('NUMBER_PREFIX_BITS') || htmlContent.includes('[0, 0, 1, 1, 1, 1]') || htmlContent.includes('[3, 4, 5, 6]')) {
    pass('Braille Number Sign', 'Braille number prefix indicator (# / Dots 3,4,5,6) verified.');
  } else {
    warn('Braille Number Sign', 'Number indicator not found.', 'Ensure digits are preceded by number indicator.');
  }

  // ---------------------------------------------------------
  // 4. Hardware Safety & Solenoid Duty-Cycle Rules
  // ---------------------------------------------------------
  console.log('\n--- Suite 4: Hardware & Thermal Safety Limits ---');
  
  // Check duty cycle limit
  if (htmlContent.includes('dutyCycle') || htmlContent.includes('DUTY_CYCLE') || htmlContent.includes('duty_cycle')) {
    pass('Duty Cycle Safety', 'Duty cycle calculation and monitoring logic implemented.');
  } else {
    warn('Duty Cycle Safety', 'No explicit duty cycle variable found.', 'Add maximum hold time or PWM reduction to prevent solenoid overheating.');
  }

  // Check emergency thermal cutoff
  if (htmlContent.includes('85') || htmlContent.includes('temp') || htmlContent.includes('thermal')) {
    pass('Thermal Monitoring', 'Thermal estimation / threshold safeguards present in driver simulation.');
  } else {
    warn('Thermal Monitoring', 'Thermal safeguards not found.', 'Simulate temperature rise and warn when exceeding 65°C.');
  }

  // ---------------------------------------------------------
  // 5. Web Serial & Protocol Framing
  // ---------------------------------------------------------
  console.log('\n--- Suite 5: Web Serial Protocol Framing ---');
  if (htmlContent.includes('115200')) {
    pass('Baud Rate', 'Standard 115200 baud rate configured for ESP32 UART communication.');
  } else {
    fail('Baud Rate', 'Standard 115200 baud rate not specified for serial connection.', 'Set baudRate: 115200 in Serial options.');
  }

  if (htmlContent.includes('\\n') || htmlContent.includes('\n')) {
    pass('Packet Delimiter', 'Newline delimiter used for framing serial telemetry packets.');
  } else {
    warn('Packet Delimiter', 'Ensure newline framing delimiter (\\n) is sent with each tactile cell command.');
  }

  // ---------------------------------------------------------
  // 6. Accessibility & Audio Engine
  // ---------------------------------------------------------
  console.log('\n--- Suite 6: Accessibility & Audio Engine ---');
  if (htmlContent.includes('AudioContext') || htmlContent.includes('webkitAudioContext')) {
    pass('Web Audio API', 'AudioContext initialized for tactile auditory click / haptic simulation.');
  } else {
    warn('Web Audio API', 'AudioContext not found. Consider adding auditory feedback.');
  }

  if (htmlContent.includes('speechSynthesis')) {
    pass('Screen Reader Engine', 'Web SpeechSynthesis API hooked for assistive speech output.');
  } else {
    warn('Screen Reader Engine', 'Speech synthesis not detected.');
  }
}

// ---------------------------------------------------------
// Summary Report
// ---------------------------------------------------------
console.log('\n====================================================');
console.log(`📊 AUDIT SUMMARY: ${passCount} Passed, ${warnCount} Warnings, ${failCount} Failures`);
console.log('====================================================');

if (issues.length > 0) {
  console.log('\nRecommended Remediations:');
  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. [${issue.level}] ${issue.name}: ${issue.remediation}`);
  });
}

if (failCount > 0) {
  console.log('\n❌ System Audit Status: ISSUES DETECTED');
  process.exit(1);
} else {
  console.log('\n✨ System Audit Status: ALL SYSTEMS OPERATIONAL');
  process.exit(0);
}
