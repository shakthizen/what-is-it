import fs from 'node:fs';
import path from 'node:path';
import type { ProjectMeta } from '../core/schema.js';

export type AgentTarget =
  | 'claude'
  | 'cursor'
  | 'antigravity'
  | 'windsurf'
  | 'cline'
  | 'copilot'
  | 'agents-md';

export interface AgentTargetInfo {
  id: AgentTarget;
  label: string;
  installs: string;
}

// Ordered for display in the selection prompt. "agents-md" is listed last as the
// generic fallback that isn't tied to one specific tool.
export const AGENT_TARGETS: AgentTargetInfo[] = [
  { id: 'claude', label: 'Claude Code', installs: '.claude/skills/what-is-it/SKILL.md, .claude/commands/, CLAUDE.md' },
  { id: 'cursor', label: 'Cursor', installs: '.cursor/rules/what-is-it.mdc, .cursorrules' },
  { id: 'antigravity', label: 'Antigravity / Gemini CLI', installs: '.agent/workflows/, GEMINI.md' },
  { id: 'windsurf', label: 'Windsurf', installs: '.windsurfrules' },
  { id: 'cline', label: 'Cline', installs: '.clinerules' },
  { id: 'copilot', label: 'GitHub Copilot', installs: '.github/copilot-instructions.md' },
  { id: 'agents-md', label: 'Generic (AGENTS.md)', installs: 'AGENTS.md — the vendor-neutral convention several tools read' }
];

export const ALL_AGENT_TARGETS: AgentTarget[] = AGENT_TARGETS.map(t => t.id);

// Only the widely-supported, vendor-neutral file when nothing was explicitly
// chosen (e.g. a non-interactive run with no --agents flag) — installing every
// proprietary format nobody asked for is exactly what this option exists to avoid.
export const DEFAULT_AGENT_TARGETS: AgentTarget[] = ['agents-md'];

export function parseAgentTargets(raw: string | undefined | null): AgentTarget[] | null {
  if (!raw || !raw.trim()) return null;
  if (raw.trim().toLowerCase() === 'all') return ALL_AGENT_TARGETS;
  const requested = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const valid = requested.filter((id): id is AgentTarget => (ALL_AGENT_TARGETS as string[]).includes(id));
  return valid.length > 0 ? Array.from(new Set(valid)) : null;
}

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
- **Web Dashboard**: Run \`npx what-is-it\` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas.

## AGENT GUIDELINES & PROTOCOL (FOLLOW STRICT):

### 1. SESSION START / ORIENTATION:
- ALWAYS run \`npx what-is-it status\` first before modifying files or answering architecture questions.
- Inspect the active task under **CURRENT FOCUS (DO NOW)**:
  - **WHY**: Rationale and business value.
  - **WHERE**: Exact file paths, routes, or components to inspect/edit.
  - **HOW**: Recommended technical approach and libraries.
  - **WHEN**: Target milestone or phase.
- If no task is active, check **NEXT QUEUED TASK** or verify priorities with the developer.

### 2. TASK COMPLETION:
- As soon as your code implementation is verified (automated tests pass, static analysis clean):
  \`npx what-is-it task done <task-id>\`
- This immediately updates \`${binFileName}\`, recalculates feature and overall progress %, regenerates \`WHAT_IS_IT.md\`, and pushes live SSE updates to the browser viewer.

### 3. RECORDING DISCOVERED TASKS (THE 4 W's):
- When you discover bugs, required refactors, or new architectural work, never leave them in chat alone. Persist them:
  \`npx what-is-it task add --feature "<feature-id>" --title "<title>" --why "<rationale>" --how "<implementation>" --where "<file-paths>" --when "<phase>" [--priority high|medium|low|urgent]\`

### 4. FEATURE SCOPING:
- When planning a major architectural module or domain:
  \`npx what-is-it feature add --id "<feature-id>" --title "<title>" --desc "<description>" --category "<category>"\`

### 5. TASK LISTING, SCHEMA & EXPORT:
- List all tasks with statuses: \`npx what-is-it task list\`
- Inspect JSON schema: \`npx what-is-it schema\`
- Export raw state: \`npx what-is-it export --format json\`
- Bulk import state: \`npx what-is-it import <file.json>\`
- Launch web dashboard: \`npx what-is-it\`

### 6. DEEP CODEBASE BOOTSTRAP (/wii-init):
- \`init\` already wrote a static, best-effort baseline (file-path pattern matching only, no code read) — export it first with \`npx what-is-it export --format json\` to see what it found.
- When user runs \`/wii-init\` in chat, do the deep pass in this order — do not skip ahead to step 2 before step 1 is done:
  1. **Verify & correct the real feature set and user flows first**, independent of anything missing/broken/insecure. Actually read the routes, components, services, and domain models; replace the baseline's generic "discovered file" sub-features with real \`why\`/\`how\` rationale, real actor roles, and real user flows/edges that reflect how the app is actually used.
  2. **Enumerate every screen/view in the UI — not a sample.** This applies regardless of what language or framework built it: React/Vue/Svelte/Angular components, Flutter widgets (Dart), SwiftUI/UIKit views (Swift), Jetpack Compose or XML layouts (Kotlin/Java), WinForms/WPF/Avalonia (C#), Qt widgets (C++/Python), server-rendered HTML templates, or a terminal/TUI's screens — whatever the actual codebase uses. For **every** screen found, generate a real, screen-specific mockup as inline SVG in \`FlowNode.data.mockupSvg\` (a single \`<svg>...</svg>\` string reflecting that screen's actual layout). Leaving a node on the generic built-in wireframe template is only acceptable for a screen you could not find any source for — it is not an acceptable default for screens you did find.
  3. **Only after** the real feature/flow model is accurate, layer in what's missing: gaps, bugs, and security issues you find — as separate \`missingDetails\` / additional sub-features explicitly marked \`status: "missing"\`, never mixed into the "what actually exists" inventory from step 1.
  4. Run \`npx what-is-it schema\` if you need the exact JSON schema.
  5. Save the synthesized state to a temporary JSON file (e.g. \`scratch/what-is-it-state.json\`).
  6. Execute: \`npx what-is-it import scratch/what-is-it-state.json\`.
  7. Run \`npx what-is-it status\` to confirm.

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
- ALWAYS run \`npx what-is-it status\` at session start BEFORE editing files or making assumptions.
- Inspect the \`CURRENT FOCUS (DO NOW)\` task: read WHY (rationale), WHERE (target files), HOW (approach), WHEN (phase).
- If no active task, inspect \`NEXT QUEUED TASK\` or check with developer.

### 2. TASK COMPLETION:
- When code is implemented and verified (tests pass, lint clean), immediately mark the task complete:
  \`npx what-is-it task done <task-id>\`
- This updates \`.what-is-it.bin\`, recalculates overall project & feature progress, regenerates \`WHAT_IS_IT.md\`, and broadcasts live SSE updates to the dashboard.

### 3. ADDING DISCOVERED TASKS (THE 4 W's):
- When new work, bug fixes, or refactors are discovered, record them with all 4 W's:
  \`npx what-is-it task add --feature "<feature-id>" --title "<title>" --why "<rationale>" --how "<implementation>" --where "<files>" --when "<phase>" [--priority high|medium|low|urgent]\`

### 4. FEATURE SCOPING:
- When planning a major architectural module or domain:
  \`npx what-is-it feature add --id "<feature-id>" --title "<title>" --desc "<description>" --category "<category>"\`

### 5. INSPECTION & SCHEMA:
- List all tasks: \`npx what-is-it task list\`
- Inspect complete JSON schema: \`npx what-is-it schema\`
- Export full state: \`npx what-is-it export --format json\`
- Bulk import state: \`npx what-is-it import <file.json>\`
- View live visual web viewer: \`npx what-is-it\`

### 6. CODEBASE BOOTSTRAP (/wii-init):
- If memory is empty or re-indexing is needed, run \`/wii-init\` to analyze routes, components, APIs, and populate domain tasks, wiki docs, and visual user flows.

### 7. CORE TENETS:
- **No Vibe Amnesia**: If it is not recorded in \`.what-is-it.bin\`, future sessions will lose context.
- **Telegraphic Output**: Keep CLI interaction token-efficient (caveman style).
- **Keep Fresh**: Always keep \`.what-is-it.bin\` and \`WHAT_IS_IT.md\` in sync with codebase state.
<!-- WHAT_IS_IT_END -->
`;

interface WorkflowFile {
  filename: string;
  content: string;
}

// The four /wii-* slash commands, defined once and reused for whichever
// ecosystems (Claude Code's .claude/commands, Antigravity's .agent/workflows)
// the user actually selected — same content, different discovery directory.
function buildWorkflowFiles(): WorkflowFile[] {
  return [
    {
      filename: 'wii-init.md',
      content: `---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect. \`init\` already wrote a static, file-path-only baseline
(no code was read) — run \`npx what-is-it export --format json\` to see it. Your job
is to replace it with a verified model, in this strict order:

**Phase 1 — Get the real feature set and user flows right, independent of anything missing or broken.**
1. Actually read the codebase (routes, components, services, domain models, README) — don't rely
   on the baseline's generic "file discovered" sub-features.
2. Identify real actor roles (e.g. Guest, Authenticated User, Admin) and group real features
   logically, each with genuine Why/How/Where/When rationale.
3. Build real user flows (React Flow nodes/edges) that reflect how the app is actually used.
4. **Find and enumerate every screen/view in the UI layer — this is mandatory, not a sample of
   a few representative screens.** Do this regardless of what language or UI framework the
   project actually uses: React/Vue/Svelte/Angular components, Flutter widgets (Dart), SwiftUI
   or UIKit views (Swift/Obj-C), Jetpack Compose or XML layouts (Kotlin/Java), WinForms/WPF/
   Avalonia (C#), Qt widgets (C++/Python), server-rendered templates (ERB, Blade, Jinja, etc.),
   or a terminal/TUI's screens. Whatever it is, find it and read it.
5. For **every** screen you found in step 4, generate a real, screen-specific mockup as inline
   SVG and set it on \`FlowNode.data.mockupSvg\` — a single \`<svg>...</svg>\` string that actually
   reflects that screen's real layout (its real sections, real text/labels, real structure) —
   not a generic placeholder. The built-in wireframe template is a fallback for screens you
   could not locate source for, not a shortcut for ones you did find.
6. Write multi-page Wiki documentation with bookmarks describing this verified architecture.

**Phase 2 — Only now, layer in what's missing.**
7. Flag genuinely missing features, bugs, and security issues you find as explicit
   \`status: "missing"\` sub-features / \`missingDetails\`, kept separate from the "what actually
   exists" model built in Phase 1 — never conflate a real feature with a wishlist item.

**Commit it:**
8. Check the schema with \`npx what-is-it schema\` if needed.
9. Write the comprehensive JSON to a temporary file (e.g. \`scratch/what-is-it-state.json\`).
10. Execute: \`npx what-is-it import scratch/what-is-it-state.json\`.
11. Run \`npx what-is-it status\` to verify.
`
    },
    {
      filename: 'wii-status.md',
      content: `---
description: Check live project memory status, progress percentage, and active tasks
---

Run \`npx what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
`
    },
    {
      filename: 'wii-task-done.md',
      content: `---
description: Mark a task as completed in what-is-it project memory
---

Mark the task complete:
Run \`npx what-is-it task done <task-id>\`.
If no task ID is provided, look at recently completed work, find the matching task ID, mark it done, and report updated overall progress.
`
    },
    {
      filename: 'wii.md',
      content: `---
description: Review high-level project architecture, features, and launch the web viewer
---

1. Run \`npx what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
`
    }
  ];
}

function writeWorkflowFiles(dir: string): string[] {
  fs.mkdirSync(dir, { recursive: true });
  const names: string[] = [];
  for (const wf of buildWorkflowFiles()) {
    fs.writeFileSync(path.join(dir, wf.filename), wf.content, 'utf-8');
    names.push(`/${wf.filename.replace(/\.md$/, '')}`);
  }
  return names;
}

// Idempotently create-or-update one of the plain-text agent rule files
// (AGENTS.md, CLAUDE.md, GEMINI.md, .cursorrules, .windsurfrules, .clinerules,
// .github/copilot-instructions.md) via the WHAT_IS_IT_START/END marker block,
// same merge behavior for all of them.
function upsertRuleFile(rootDir: string, file: string): boolean {
  const rulePath = path.join(rootDir, file);
  const parentDir = path.dirname(rulePath);
  if (!fs.existsSync(parentDir)) {
    try {
      fs.mkdirSync(parentDir, { recursive: true });
    } catch {
      return false;
    }
  }

  if (fs.existsSync(rulePath)) {
    const existing = fs.readFileSync(rulePath, 'utf-8');
    if (existing.includes(AGENT_RULE_MARKER)) {
      const regex = /<!-- WHAT_IS_IT_START -->[\s\S]*?<!-- WHAT_IS_IT_END -->/g;
      fs.writeFileSync(rulePath, existing.replace(regex, AGENT_RULE_CONTENT.trim()), 'utf-8');
    } else {
      fs.writeFileSync(rulePath, existing + '\n' + AGENT_RULE_CONTENT, 'utf-8');
    }
  } else {
    fs.writeFileSync(rulePath, AGENT_RULE_CONTENT.trim() + '\n', 'utf-8');
  }
  return true;
}

// The /wii-init workflow tells the agent to stage its deep-pass output at
// scratch/what-is-it-state.json, and `import` deletes it (and the scratch/
// directory, if left empty) once it succeeds. That only covers the happy
// path — if import fails, is skipped, or runs with --no-clean, the scratch
// file is just an ordinary file sitting in the repo. Guard against it ever
// landing in a commit by ensuring scratch/ is git-ignored up front.
function ensureScratchIgnored(rootDir: string): void {
  const gitignorePath = path.join(rootDir, '.gitignore');
  const entry = 'scratch/';
  try {
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, `${entry}\n`, 'utf-8');
      return;
    }
    const existing = fs.readFileSync(gitignorePath, 'utf-8');
    const alreadyIgnored = existing.split('\n').some(line => line.trim().replace(/\/$/, '') === 'scratch');
    if (!alreadyIgnored) {
      const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');
      fs.writeFileSync(gitignorePath, existing + (needsLeadingNewline ? '\n' : '') + `${entry}\n`, 'utf-8');
    }
  } catch {
    // Best-effort — not worth failing skill installation over a missing/unwritable .gitignore.
  }
}

export function installSkills(
  options: SkillInstallOptions & { agents?: AgentTarget[] }
): {
  skillPath?: string;
  rulesUpdated: string[];
  slashCommands: string[];
} {
  const { rootDir, agents = DEFAULT_AGENT_TARGETS } = options;
  const rulesUpdated: string[] = [];
  let slashCommands: string[] = [];
  let skillPath: string | undefined;

  ensureScratchIgnored(rootDir);

  // Claude Code: real skill format at .claude/skills/<name>/SKILL.md (not a
  // made-up path — this is the directory Claude Code actually discovers
  // project skills from), plus its native .claude/commands/ slash commands.
  if (agents.includes('claude')) {
    const skillDir = path.join(rootDir, '.claude', 'skills', 'what-is-it');
    fs.mkdirSync(skillDir, { recursive: true });
    skillPath = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(skillPath, generateDynamicSkill(options), 'utf-8');

    const claudeCmdDir = path.join(rootDir, '.claude', 'commands');
    slashCommands = Array.from(new Set([...slashCommands, ...writeWorkflowFiles(claudeCmdDir)]));

    if (upsertRuleFile(rootDir, 'CLAUDE.md')) rulesUpdated.push('CLAUDE.md');
  }

  // Antigravity / Gemini CLI: .agent/workflows/ slash commands + GEMINI.md context file.
  if (agents.includes('antigravity')) {
    const agWorkflowDir = path.join(rootDir, '.agent', 'workflows');
    slashCommands = Array.from(new Set([...slashCommands, ...writeWorkflowFiles(agWorkflowDir)]));

    if (upsertRuleFile(rootDir, 'GEMINI.md')) rulesUpdated.push('GEMINI.md');
  }

  // Cursor: .cursor/rules/*.mdc + legacy .cursorrules.
  if (agents.includes('cursor')) {
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
    if (upsertRuleFile(rootDir, '.cursorrules')) rulesUpdated.push('.cursorrules');
  }

  if (agents.includes('windsurf')) {
    if (upsertRuleFile(rootDir, '.windsurfrules')) rulesUpdated.push('.windsurfrules');
  }

  if (agents.includes('cline')) {
    if (upsertRuleFile(rootDir, '.clinerules')) rulesUpdated.push('.clinerules');
  }

  if (agents.includes('copilot')) {
    if (upsertRuleFile(rootDir, '.github/copilot-instructions.md')) rulesUpdated.push('.github/copilot-instructions.md');
  }

  if (agents.includes('agents-md')) {
    if (upsertRuleFile(rootDir, 'AGENTS.md')) rulesUpdated.push('AGENTS.md');
  }

  return { skillPath, rulesUpdated, slashCommands };
}
