import fs from 'node:fs';
import path from 'node:path';

export const SKILL_CONTENT = `---
name: what-is-it
description: Live project memory, task tracker, and visual wiki. Use when starting work, completing tasks, adding features, or checking architecture.
---

# WHAT-IS-IT: LIVE PROJECT MEMORY & WIKI

Ugg. Agent listen good.
This project uses \`what-is-it\` to track tasks, architecture, and UI flows.
Project state stored in \`.what-is-it.bin\` (compressed binary).
Overview mirror stored in \`WHAT_IS_IT.md\`.

## AGENT RULES (FOLLOW STRICT):

1. TASK START:
   Run \`npx what-is-it status\` first.
   Check active tasks, target files (WHERE), rationale (WHY), and technical approach (HOW).

2. TASK FINISH:
   When work done, run:
   \`npx what-is-it task done <task-id>\`
   Binary updates. Progress increments. Browser live-reloads via SSE.

3. NEW TASK:
   When new work discovered, run:
   \`npx what-is-it task add --feature "<feature-id>" --title "<title>" --why "<why>" --how "<how>" --where "<files>" --when "<phase>"\`

4. NEW FEATURE:
   When building major module, run:
   \`npx what-is-it feature add --id "<id>" --title "<title>" --desc "<desc>"\`

5. VIEW INTERACTIVE DASHBOARD:
   Run \`npx what-is-it\` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas in browser.

Live memory stops vibe coding amnesia. Always keep state fresh.
`;

export const AGENT_RULE_MARKER = '<!-- WHAT_IS_IT_START -->';
export const AGENT_RULE_CONTENT = `
<!-- WHAT_IS_IT_START -->
## Project Memory Protocol (what-is-it)
Ugg. This project tracks live memory with \`what-is-it\`.
- Start session: run \`npx what-is-it status\` to see active tasks and target files.
- Finish task: run \`npx what-is-it task done <task-id>\`.
- Keep \`.what-is-it.bin\` live and fresh.
<!-- WHAT_IS_IT_END -->
`;

export function installSkills(rootDir: string): { skillPath: string; rulesUpdated: string[] } {
  // 1. Install skill in .agents/skills/what-is-it/SKILL.md
  const skillDir = path.join(rootDir, '.agents', 'skills', 'what-is-it');
  fs.mkdirSync(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillPath, SKILL_CONTENT, 'utf-8');

  const rulesUpdated: string[] = [];

  // 2. Append to AGENTS.md or GEMINI.md if present or create AGENTS.md
  const targetRuleFiles = ['AGENTS.md', 'GEMINI.md'];
  for (const file of targetRuleFiles) {
    const rulePath = path.join(rootDir, file);
    if (fs.existsSync(rulePath)) {
      const existing = fs.readFileSync(rulePath, 'utf-8');
      if (!existing.includes(AGENT_RULE_MARKER)) {
        fs.writeFileSync(rulePath, existing + '\n' + AGENT_RULE_CONTENT, 'utf-8');
        rulesUpdated.push(file);
      }
    }
  }

  // If neither existed, create AGENTS.md
  if (rulesUpdated.length === 0 && !fs.existsSync(path.join(rootDir, 'AGENTS.md'))) {
    const agentsPath = path.join(rootDir, 'AGENTS.md');
    fs.writeFileSync(agentsPath, AGENT_RULE_CONTENT.trim() + '\n', 'utf-8');
    rulesUpdated.push('AGENTS.md');
  }

  return { skillPath, rulesUpdated };
}
