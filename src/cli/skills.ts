import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import pc from 'picocolors';
import type { ProjectMeta } from '../core/schema.js';

export interface SkillInstallOptions {
  rootDir: string;
  meta?: ProjectMeta;
  binFileName?: string;
}

export function generateDynamicSkill(options: SkillInstallOptions): string {
  const { rootDir, meta, binFileName = '.what-is-it.bin' } = options;
  const absBinPath = path.resolve(rootDir, binFileName);
  const relBinPath = `./${binFileName}`;
  const name = meta?.name || path.basename(rootDir);
  const type = meta?.projectType || 'project';
  const frameworks = meta?.frameworks?.join(', ') || 'Auto-detected';

  return `---
name: what-is-it
description: Live project memory, task tracker, and visual wiki. Use when starting work, completing tasks, adding features, or checking architecture.
---

# WHAT-IS-IT: LIVE PROJECT MEMORY & WIKI

Ugg. Agent listen good.
This project uses \`what-is-it\` to track tasks, architecture, and UI flows.

## PROJECT CONTEXT:
- **Project Name**: ${name}
- **Project Type**: \`${type}\`
- **Frameworks**: ${frameworks}
- **Binary State File (Primary)**:
  - Relative: \`${relBinPath}\`
  - Absolute: \`${absBinPath}\`
- **Markdown Overview (Mirror)**: \`./WHAT_IS_IT.md\`
- **Web Dashboard**: Run \`npx what-is-it\` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas.

## AGENT RULES (FOLLOW STRICT):

1. TASK START / SESSION ALIGNMENT:
   Run \`npx what-is-it status\` first.
   Check active tasks, target files (WHERE), rationale (WHY), and technical approach (HOW).

2. TASK FINISH:
   When work done, run:
   \`npx what-is-it task done <task-id>\`
   Binary updates immediately. Progress increments. Browser live-reloads via SSE.

3. NEW TASK:
   When new work is discovered or planned, run:
   \`npx what-is-it task add --feature "<feature-id>" --title "<title>" --why "<why>" --how "<how>" --where "<files>" --when "<phase>"\`

4. DEEP CODEBASE BOOTSTRAP (/what-is-it-init):
   When user runs \`/what-is-it-init\` in chat:
   - Deeply analyze this codebase (manifests, routes, components, services, database models).
   - Formulate real features, tasks with (Why, How, Where, When), multi-page Wiki docs, and React Flow user journeys with SVG mockup frames.
   - Run \`npx what-is-it schema\` if you need the exact JSON schema.
   - Save the synthesized state to a temporary JSON file (e.g. \`scratch/what-is-it-state.json\`).
   - Execute: \`npx what-is-it import scratch/what-is-it-state.json\`.
   - Run \`npx what-is-it status\` to confirm.

Live memory stops vibe coding amnesia. Always keep state fresh.
`;
}

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

export function installSkills(options: SkillInstallOptions): {
  skillPath: string;
  rulesUpdated: string[];
  slashCommands: string[];
} {
  const { rootDir } = options;
  const rulesUpdated: string[] = [];
  const slashCommands: string[] = [];

  // 1. Install project-specific skill in .agents/skills/what-is-it/SKILL.md
  const skillDir = path.join(rootDir, '.agents', 'skills', 'what-is-it');
  fs.mkdirSync(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, 'SKILL.md');
  const skillContent = generateDynamicSkill(options);
  fs.writeFileSync(skillPath, skillContent, 'utf-8');

  // 2. Install Slash Commands across Agent IDEs
  // A. Antigravity / Gemini Workflows: .agent/workflows/
  const agWorkflowDir = path.join(rootDir, '.agent', 'workflows');
  fs.mkdirSync(agWorkflowDir, { recursive: true });

  // /what-is-it-init workflow
  fs.writeFileSync(
    path.join(agWorkflowDir, 'what-is-it-init.md'),
    `---
description: Deeply analyze this codebase and initialize live project memory with what-is-it
---

# Initialize Project Memory (what-is-it)

You are the Project Memory Architect.
1. Read the codebase (package manifests, main routes, key components, services, and README).
2. Understand:
   - The product overview & architecture summary
   - Identified actor roles (e.g. Guest, Authenticated User, Admin)
   - Core features grouped logically
   - Key completed and pending tasks with Why, How, Where, and When
   - Multi-page Wiki documentation with bookmarks
   - Visual user flow with vector SVG mockup frames (Desktop, Mobile, Modal)
3. Check the schema with \`npx what-is-it schema\`.
4. Formulate the comprehensive JSON and write to a temporary file (e.g. \`scratch/what-is-it-state.json\`).
5. Execute: \`npx what-is-it import scratch/what-is-it-state.json\`.
6. Run \`npx what-is-it status\` to verify.
`,
    'utf-8'
  );
  slashCommands.push('/what-is-it-init');

  // /status workflow
  fs.writeFileSync(
    path.join(agWorkflowDir, 'status.md'),
    `---
description: Check live project memory status, progress percentage, and active tasks
---

Run \`npx what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
`,
    'utf-8'
  );
  slashCommands.push('/status');

  // /task-done workflow
  fs.writeFileSync(
    path.join(agWorkflowDir, 'task-done.md'),
    `---
description: Mark a task as completed in what-is-it project memory
---

Mark the task complete:
Run \`npx what-is-it task done <task-id>\`.
If no task ID is provided, look at recently completed work, find the matching task ID, mark it done, and report updated overall progress.
`,
    'utf-8'
  );
  slashCommands.push('/task-done');

  // /what-is-it overview workflow
  fs.writeFileSync(
    path.join(agWorkflowDir, 'what-is-it.md'),
    `---
description: Review high-level project architecture, features, and launch the web viewer
---

1. Run \`npx what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
`,
    'utf-8'
  );
  slashCommands.push('/what-is-it');

  // B. Claude Code Commands: .claude/commands/
  const claudeCmdDir = path.join(rootDir, '.claude', 'commands');
  try {
    fs.mkdirSync(claudeCmdDir, { recursive: true });
    fs.copyFileSync(path.join(agWorkflowDir, 'what-is-it-init.md'), path.join(claudeCmdDir, 'what-is-it-init.md'));
    fs.copyFileSync(path.join(agWorkflowDir, 'status.md'), path.join(claudeCmdDir, 'status.md'));
    fs.copyFileSync(path.join(agWorkflowDir, 'task-done.md'), path.join(claudeCmdDir, 'task-done.md'));
    fs.copyFileSync(path.join(agWorkflowDir, 'what-is-it.md'), path.join(claudeCmdDir, 'what-is-it.md'));
  } catch {
    // Ignore optional folder creation
  }

  // C. Cursor Rules: .cursor/rules/what-is-it.mdc & .cursorrules
  const cursorRulesDir = path.join(rootDir, '.cursor', 'rules');
  try {
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    fs.writeFileSync(
      path.join(cursorRulesDir, 'what-is-it.mdc'),
      `---
description: Live project memory protocol for what-is-it
globs: *
---
${AGENT_RULE_CONTENT.trim()}
`,
      'utf-8'
    );
  } catch {
    // Ignore
  }

  // 3. Multi-Agent Rule Files (AGENTS.md, GEMINI.md, CLAUDE.md, .cursorrules, .windsurfrules, .clinerules)
  const ruleFiles = [
    'AGENTS.md',
    'GEMINI.md',
    'CLAUDE.md',
    '.cursorrules',
    '.windsurfrules',
    '.clinerules',
    '.github/copilot-instructions.md'
  ];

  for (const file of ruleFiles) {
    const rulePath = path.join(rootDir, file);
    const parentDir = path.dirname(rulePath);
    if (!fs.existsSync(parentDir)) {
      try { fs.mkdirSync(parentDir, { recursive: true }); } catch { continue; }
    }

    if (fs.existsSync(rulePath)) {
      const existing = fs.readFileSync(rulePath, 'utf-8');
      if (!existing.includes(AGENT_RULE_MARKER)) {
        fs.writeFileSync(rulePath, existing + '\n' + AGENT_RULE_CONTENT, 'utf-8');
        rulesUpdated.push(file);
      }
    } else if (file === 'AGENTS.md' || file === 'CLAUDE.md' || file === '.cursorrules') {
      fs.writeFileSync(rulePath, AGENT_RULE_CONTENT.trim() + '\n', 'utf-8');
      rulesUpdated.push(file);
    }
  }

  return { skillPath, rulesUpdated, slashCommands };
}

export function installGlobalSkill(): { globalSkillPath: string; success: boolean } {
  try {
    const homeDir = os.homedir();
    // 1. Antigravity / Gemini global skills directory
    const globalSkillDir = path.join(homeDir, '.gemini', 'config', 'skills', 'what-is-it');
    fs.mkdirSync(globalSkillDir, { recursive: true });
    const globalSkillPath = path.join(globalSkillDir, 'SKILL.md');

    const globalContent = `---
name: what-is-it
description: Live project memory, task tracker, and visual wiki. Use when starting work, completing tasks, adding features, or checking architecture.
---

# WHAT-IS-IT: LIVE PROJECT MEMORY & WIKI (GLOBAL SYSTEM SKILL)

Ugg. Agent listen good.
When working in any project that uses \`what-is-it\`:
1. Check project status: \`npx what-is-it status\`
2. When completing tasks: \`npx what-is-it task done <id>\`
3. When adding tasks: \`npx what-is-it task add --title "..." --why "..." --where "..."\`
4. View live dashboard: \`npx what-is-it\`
`;

    fs.writeFileSync(globalSkillPath, globalContent, 'utf-8');
    return { globalSkillPath, success: true };
  } catch (err) {
    console.error(pc.red(`Failed to install global skill: ${(err as Error).message}`));
    return { globalSkillPath: '', success: false };
  }
}
