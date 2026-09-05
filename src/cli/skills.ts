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
This project uses \`@shakthizen/what-is-it\` to track tasks, architecture, and UI flows.

## PROJECT CONTEXT:
- **Project Name**: ${name}
- **Project Type**: \`${type}\`
- **Frameworks**: ${frameworks}
- **Binary State File (Primary)**:
  - Relative: \`${relBinPath}\`
  - Absolute: \`${absBinPath}\`
- **Markdown Overview (Mirror)**: \`./WHAT_IS_IT.md\`
- **Web Dashboard**: Run \`npx @shakthizen/what-is-it\` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas.

## AGENT GUIDELINES & PROTOCOL (FOLLOW STRICT):

### 1. SESSION START / ORIENTATION:
- ALWAYS run \`npx @shakthizen/what-is-it status\` first before modifying files or answering architecture questions.
- Inspect the active task under **CURRENT FOCUS (DO NOW)**:
  - **WHY**: Rationale and business value.
  - **WHERE**: Exact file paths, routes, or components to inspect/edit.
  - **HOW**: Recommended technical approach and libraries.
  - **WHEN**: Target milestone or phase.
- If no task is active, check **NEXT QUEUED TASK** or verify priorities with the developer.

### 2. TASK COMPLETION:
- As soon as your code implementation is verified (automated tests pass, static analysis clean):
  \`npx @shakthizen/what-is-it task done <task-id>\`
- This immediately updates \`${binFileName}\`, recalculates feature and overall progress %, regenerates \`WHAT_IS_IT.md\`, and pushes live SSE updates to the browser viewer.

### 3. RECORDING DISCOVERED TASKS (THE 4 W's):
- When you discover bugs, required refactors, or new architectural work, never leave them in chat alone. Persist them:
  \`npx @shakthizen/what-is-it task add --feature "<feature-id>" --title "<title>" --why "<rationale>" --how "<implementation>" --where "<file-paths>" --when "<phase>" [--priority high|medium|low|urgent]\`

### 4. FEATURE SCOPING:
- When planning a major architectural module or domain:
  \`npx @shakthizen/what-is-it feature add --id "<feature-id>" --title "<title>" --desc "<description>" --category "<category>"\`

### 5. TASK LISTING, SCHEMA & EXPORT:
- List all tasks with statuses: \`npx @shakthizen/what-is-it task list\`
- Inspect JSON schema: \`npx @shakthizen/what-is-it schema\`
- Export raw state: \`npx @shakthizen/what-is-it export --format json\`
- Bulk import state: \`npx @shakthizen/what-is-it import <file.json>\`
- Launch web dashboard: \`npx @shakthizen/what-is-it\`

### 6. DEEP CODEBASE BOOTSTRAP (/what-is-it-init):
- When user runs \`/what-is-it-init\` in chat:
  1. Deeply analyze this codebase (manifests, routes, components, services, database models).
  2. Formulate real features, tasks with (Why, How, Where, When), multi-page Wiki docs, and React Flow user journeys with SVG mockup frames.
  3. Run \`npx @shakthizen/what-is-it schema\` if you need the exact JSON schema.
  4. Save the synthesized state to a temporary JSON file (e.g. \`scratch/what-is-it-state.json\`).
  5. Execute: \`npx @shakthizen/what-is-it import scratch/what-is-it-state.json\`.
  6. Run \`npx @shakthizen/what-is-it status\` to confirm.

### 7. CORE TENETS:
- **No Vibe Amnesia**: If it is not recorded in \`${binFileName}\`, future agent sessions will lose context.
- **Telegraphic Output**: Keep CLI outputs dense and token-efficient to preserve LLM context windows.
- **Keep Fresh**: Always keep memory state aligned with code reality.
`;
}

export const AGENT_RULE_MARKER = '<!-- WHAT_IS_IT_START -->';
export const AGENT_RULE_CONTENT = `
<!-- WHAT_IS_IT_START -->
## Project Memory Protocol (@shakthizen/what-is-it)
Ugg. This project tracks live memory, tasks, architecture, and UI flows with \`@shakthizen/what-is-it\`.

### 1. SESSION START / ORIENTATION:
- ALWAYS run \`npx @shakthizen/what-is-it status\` at session start BEFORE editing files or making assumptions.
- Inspect the \`CURRENT FOCUS (DO NOW)\` task: read WHY (rationale), WHERE (target files), HOW (approach), WHEN (phase).
- If no active task, inspect \`NEXT QUEUED TASK\` or check with developer.

### 2. TASK COMPLETION:
- When code is implemented and verified (tests pass, lint clean), immediately mark the task complete:
  \`npx @shakthizen/what-is-it task done <task-id>\`
- This updates \`.what-is-it.bin\`, recalculates overall project & feature progress, regenerates \`WHAT_IS_IT.md\`, and broadcasts live SSE updates to the dashboard.

### 3. ADDING DISCOVERED TASKS (THE 4 W's):
- When new work, bug fixes, or refactors are discovered, record them with all 4 W's:
  \`npx @shakthizen/what-is-it task add --feature "<feature-id>" --title "<title>" --why "<rationale>" --how "<implementation>" --where "<files>" --when "<phase>" [--priority high|medium|low|urgent]\`

### 4. FEATURE SCOPING:
- When planning a major architectural module or domain:
  \`npx @shakthizen/what-is-it feature add --id "<feature-id>" --title "<title>" --desc "<description>" --category "<category>"\`

### 5. INSPECTION & SCHEMA:
- List all tasks: \`npx @shakthizen/what-is-it task list\`
- Inspect complete JSON schema: \`npx @shakthizen/what-is-it schema\`
- Export full state: \`npx @shakthizen/what-is-it export --format json\`
- Bulk import state: \`npx @shakthizen/what-is-it import <file.json>\`
- View live visual web viewer: \`npx @shakthizen/what-is-it\`

### 6. CODEBASE BOOTSTRAP (/what-is-it-init):
- If memory is empty or re-indexing is needed, run \`/what-is-it-init\` to analyze routes, components, APIs, and populate domain tasks, wiki docs, and visual user flows.

### 7. CORE TENETS:
- **No Vibe Amnesia**: If it is not recorded in \`.what-is-it.bin\`, future sessions will lose context.
- **Telegraphic Output**: Keep CLI interaction token-efficient (caveman style).
- **Keep Fresh**: Always keep \`.what-is-it.bin\` and \`WHAT_IS_IT.md\` in sync with codebase state.
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
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect.
1. Read the codebase (package manifests, main routes, key components, services, and README).
2. Understand:
   - The product overview & architecture summary
   - Identified actor roles (e.g. Guest, Authenticated User, Admin)
   - Core features grouped logically
   - Key completed and pending tasks with Why, How, Where, and When
   - Multi-page Wiki documentation with bookmarks
   - Visual user flow with vector SVG mockup frames (Desktop, Mobile, Modal)
3. Check the schema with \`npx @shakthizen/what-is-it schema\`.
4. Formulate the comprehensive JSON and write to a temporary file (e.g. \`scratch/what-is-it-state.json\`).
5. Execute: \`npx @shakthizen/what-is-it import scratch/what-is-it-state.json\`.
6. Run \`npx @shakthizen/what-is-it status\` to verify.
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

Run \`npx @shakthizen/what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
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
Run \`npx @shakthizen/what-is-it task done <task-id>\`.
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

1. Run \`npx @shakthizen/what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx @shakthizen/what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
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
      if (existing.includes(AGENT_RULE_MARKER)) {
        const regex = /<!-- WHAT_IS_IT_START -->[\s\S]*?<!-- WHAT_IS_IT_END -->/g;
        const updated = existing.replace(regex, AGENT_RULE_CONTENT.trim());
        fs.writeFileSync(rulePath, updated, 'utf-8');
        rulesUpdated.push(file);
      } else {
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
When working in any project that uses \`@shakthizen/what-is-it\`:

## AGENT GUIDELINES & PROTOCOL:
1. **Check Status First**:
   \`npx @shakthizen/what-is-it status\`
   Read CURRENT FOCUS task: WHY (value), WHERE (target files), HOW (approach), WHEN (phase).

2. **Complete Tasks Immediately**:
   When code is tested and verified, run:
   \`npx @shakthizen/what-is-it task done <id>\`
   Updates binary, recalculates progress %, and pushes live SSE updates.

3. **Record Discovered Tasks (4 W's)**:
   When discovering new work or fixes:
   \`npx @shakthizen/what-is-it task add --feature "<feature-id>" --title "..." --why "..." --how "..." --where "..." --when "..."\`

4. **Add Architectural Features**:
   \`npx @shakthizen/what-is-it feature add --id "<id>" --title "..." --desc "..." --category "..."\`

5. **Inspect & Manage State**:
   - List tasks: \`npx @shakthizen/what-is-it task list\`
   - Inspect schema: \`npx @shakthizen/what-is-it schema\`
   - Export state: \`npx @shakthizen/what-is-it export --format json\`
   - Import state: \`npx @shakthizen/what-is-it import <file.json>\`

6. **View Live Dashboard**:
   \`npx @shakthizen/what-is-it\`
   Opens interactive web viewer with React Flow canvas and live documentation.

7. **Codebase Bootstrap**:
   In fresh projects, run \`npx @shakthizen/what-is-it init\` or \`/what-is-it-init\` in chat to auto-map architecture.
`;

    fs.writeFileSync(globalSkillPath, globalContent, 'utf-8');
    return { globalSkillPath, success: true };
  } catch (err) {
    console.error(pc.red(`Failed to install global skill: ${(err as Error).message}`));
    return { globalSkillPath: '', success: false };
  }
}
