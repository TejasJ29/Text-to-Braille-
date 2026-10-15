# Workspace Agents Configuration: Text-to-Braille Simulator

This workspace is equipped with the **Bug Hunter & QA Sentry Agent**.

## Agent Directives

1. **Continuous Sanity & Bug Guard**:
   - Whenever editing or refactoring code in `ai-braille-tactile-simulator/index.html` or `src/`, immediately verify that:
     - No JavaScript syntax errors or unclosed blocks were introduced.
     - All `getElementById` calls resolve to valid elements.
     - All Grade 1 Braille translation mappings remain intact.
2. **Hardware & Electrical Safety**:
   - Ensure solenoid coil duty cycle protection is never bypassed.
   - Maintain 115200 baud 8N1 serial protocol framing.
3. **Execution of Automated Audits**:
   - The agent can run `.agents/skills/bug-hunter/scripts/audit-bugs.js` at any time to verify system health.
