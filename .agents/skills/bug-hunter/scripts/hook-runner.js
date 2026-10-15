#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Read stdin if any
process.stdin.resume();
let inputData = '';
process.stdin.on('data', chunk => { inputData += chunk; });
process.stdin.on('end', () => {
  try {
    const auditScript = path.join(__dirname, 'audit-bugs.js');
    execSync(`node "${auditScript}"`, { stdio: 'inherit' });
  } catch (err) {
    // Audit found issues or failed
  }
  // Hook contract expects empty JSON on stdout
  process.stdout.write('{}\n');
});
