import {
  DEFAULT_FILE_NAME,
  generateMarkdownOverview,
  getProjectJsonSchema,
  loadProjectData,
  projectExists,
  saveProjectData,
  scanProject,
  synthesizeProjectData,
  validateProjectData
} from "../chunk-MKNTG5LN.js";

// src/cli/index.ts
import { Command } from "commander";
import path3 from "path";
import fs3 from "fs";
import readline from "readline";
import pc3 from "picocolors";

// src/cli/skills.ts
import fs from "fs";
import path from "path";
var AGENT_TARGETS = [
  { id: "claude", label: "Claude Code", installs: ".claude/skills/what-is-it/SKILL.md, .claude/commands/, CLAUDE.md" },
  { id: "cursor", label: "Cursor", installs: ".cursor/rules/what-is-it.mdc, .cursorrules" },
  { id: "antigravity", label: "Antigravity / Gemini CLI", installs: ".agent/workflows/, GEMINI.md" },
  { id: "windsurf", label: "Windsurf", installs: ".windsurfrules" },
  { id: "cline", label: "Cline", installs: ".clinerules" },
  { id: "copilot", label: "GitHub Copilot", installs: ".github/copilot-instructions.md" },
  { id: "agents-md", label: "Generic (AGENTS.md)", installs: "AGENTS.md \u2014 the vendor-neutral convention several tools read" }
];
var ALL_AGENT_TARGETS = AGENT_TARGETS.map((t) => t.id);
var DEFAULT_AGENT_TARGETS = ["agents-md"];
function parseAgentTargets(raw) {
  if (!raw || !raw.trim()) return null;
  if (raw.trim().toLowerCase() === "all") return ALL_AGENT_TARGETS;
  const requested = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const valid = requested.filter((id) => ALL_AGENT_TARGETS.includes(id));
  return valid.length > 0 ? Array.from(new Set(valid)) : null;
}
function generateDynamicSkill(options) {
  const { rootDir, meta, binFileName = ".what-is-it.bin" } = options;
  const absBinPath = path.resolve(rootDir, binFileName);
  const relBinPath = `./${binFileName}`;
  const name = meta?.name || path.basename(rootDir);
  const type = meta?.projectType || "project";
  const frameworks = meta?.frameworks?.join(", ") || "Auto-detected";
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
- \`init\` already wrote a static, best-effort baseline (file-path pattern matching only, no code read) \u2014 export it first with \`npx what-is-it export --format json\` to see what it found.
- When user runs \`/wii-init\` in chat, do the deep pass in this order \u2014 do not skip ahead to step 2 before step 1 is done:
  1. **Verify & correct the real feature set and user flows first**, independent of anything missing/broken/insecure. Actually read the routes, components, services, and domain models; replace the baseline's generic "discovered file" sub-features with real \`why\`/\`how\` rationale, real actor roles, and real user flows/edges that reflect how the app is actually used.
  2. **Enumerate every screen/view in the UI \u2014 not a sample.** This applies regardless of what language or framework built it: React/Vue/Svelte/Angular components, Flutter widgets (Dart), SwiftUI/UIKit views (Swift), Jetpack Compose or XML layouts (Kotlin/Java), WinForms/WPF/Avalonia (C#), Qt widgets (C++/Python), server-rendered HTML templates, or a terminal/TUI's screens \u2014 whatever the actual codebase uses. For **every** screen found, generate a real, screen-specific mockup as inline SVG in \`FlowNode.data.mockupSvg\` (a single \`<svg>...</svg>\` string reflecting that screen's actual layout). Leaving a node on the generic built-in wireframe template is only acceptable for a screen you could not find any source for \u2014 it is not an acceptable default for screens you did find.
  3. **Only after** the real feature/flow model is accurate, layer in what's missing: gaps, bugs, and security issues you find \u2014 as separate \`missingDetails\` / additional sub-features explicitly marked \`status: "missing"\`, never mixed into the "what actually exists" inventory from step 1.
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
var AGENT_RULE_MARKER = "<!-- WHAT_IS_IT_START -->";
var AGENT_RULE_CONTENT = `
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
function buildWorkflowFiles() {
  return [
    {
      filename: "wii-init.md",
      content: `---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect. \`init\` already wrote a static, file-path-only baseline
(no code was read) \u2014 run \`npx what-is-it export --format json\` to see it. Your job
is to replace it with a verified model, in this strict order:

**Phase 1 \u2014 Get the real feature set and user flows right, independent of anything missing or broken.**
1. Actually read the codebase (routes, components, services, domain models, README) \u2014 don't rely
   on the baseline's generic "file discovered" sub-features.
2. Identify real actor roles (e.g. Guest, Authenticated User, Admin) and group real features
   logically, each with genuine Why/How/Where/When rationale.
3. Build real user flows (React Flow nodes/edges) that reflect how the app is actually used.
4. **Find and enumerate every screen/view in the UI layer \u2014 this is mandatory, not a sample of
   a few representative screens.** Do this regardless of what language or UI framework the
   project actually uses: React/Vue/Svelte/Angular components, Flutter widgets (Dart), SwiftUI
   or UIKit views (Swift/Obj-C), Jetpack Compose or XML layouts (Kotlin/Java), WinForms/WPF/
   Avalonia (C#), Qt widgets (C++/Python), server-rendered templates (ERB, Blade, Jinja, etc.),
   or a terminal/TUI's screens. Whatever it is, find it and read it.
5. For **every** screen you found in step 4, generate a real, screen-specific mockup as inline
   SVG and set it on \`FlowNode.data.mockupSvg\` \u2014 a single \`<svg>...</svg>\` string that actually
   reflects that screen's real layout (its real sections, real text/labels, real structure) \u2014
   not a generic placeholder. The built-in wireframe template is a fallback for screens you
   could not locate source for, not a shortcut for ones you did find.
6. Write multi-page Wiki documentation with bookmarks describing this verified architecture.

**Phase 2 \u2014 Only now, layer in what's missing.**
7. Flag genuinely missing features, bugs, and security issues you find as explicit
   \`status: "missing"\` sub-features / \`missingDetails\`, kept separate from the "what actually
   exists" model built in Phase 1 \u2014 never conflate a real feature with a wishlist item.

**Commit it:**
8. Check the schema with \`npx what-is-it schema\` if needed.
9. Write the comprehensive JSON to a temporary file (e.g. \`scratch/what-is-it-state.json\`).
10. Execute: \`npx what-is-it import scratch/what-is-it-state.json\`.
11. Run \`npx what-is-it status\` to verify.
`
    },
    {
      filename: "wii-status.md",
      content: `---
description: Check live project memory status, progress percentage, and active tasks
---

Run \`npx what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
`
    },
    {
      filename: "wii-task-done.md",
      content: `---
description: Mark a task as completed in what-is-it project memory
---

Mark the task complete:
Run \`npx what-is-it task done <task-id>\`.
If no task ID is provided, look at recently completed work, find the matching task ID, mark it done, and report updated overall progress.
`
    },
    {
      filename: "wii.md",
      content: `---
description: Review high-level project architecture, features, and launch the web viewer
---

1. Run \`npx what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
`
    }
  ];
}
function writeWorkflowFiles(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const names = [];
  for (const wf of buildWorkflowFiles()) {
    fs.writeFileSync(path.join(dir, wf.filename), wf.content, "utf-8");
    names.push(`/${wf.filename.replace(/\.md$/, "")}`);
  }
  return names;
}
function upsertRuleFile(rootDir, file) {
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
    const existing = fs.readFileSync(rulePath, "utf-8");
    if (existing.includes(AGENT_RULE_MARKER)) {
      const regex = /<!-- WHAT_IS_IT_START -->[\s\S]*?<!-- WHAT_IS_IT_END -->/g;
      fs.writeFileSync(rulePath, existing.replace(regex, AGENT_RULE_CONTENT.trim()), "utf-8");
    } else {
      fs.writeFileSync(rulePath, existing + "\n" + AGENT_RULE_CONTENT, "utf-8");
    }
  } else {
    fs.writeFileSync(rulePath, AGENT_RULE_CONTENT.trim() + "\n", "utf-8");
  }
  return true;
}
function ensureScratchIgnored(rootDir) {
  const gitignorePath = path.join(rootDir, ".gitignore");
  const entry = "scratch/";
  try {
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, `${entry}
`, "utf-8");
      return;
    }
    const existing = fs.readFileSync(gitignorePath, "utf-8");
    const alreadyIgnored = existing.split("\n").some((line) => line.trim().replace(/\/$/, "") === "scratch");
    if (!alreadyIgnored) {
      const needsLeadingNewline = existing.length > 0 && !existing.endsWith("\n");
      fs.writeFileSync(gitignorePath, existing + (needsLeadingNewline ? "\n" : "") + `${entry}
`, "utf-8");
    }
  } catch {
  }
}
function installSkills(options) {
  const { rootDir, agents = DEFAULT_AGENT_TARGETS } = options;
  const rulesUpdated = [];
  let slashCommands = [];
  let skillPath;
  ensureScratchIgnored(rootDir);
  if (agents.includes("claude")) {
    const skillDir = path.join(rootDir, ".claude", "skills", "what-is-it");
    fs.mkdirSync(skillDir, { recursive: true });
    skillPath = path.join(skillDir, "SKILL.md");
    fs.writeFileSync(skillPath, generateDynamicSkill(options), "utf-8");
    const claudeCmdDir = path.join(rootDir, ".claude", "commands");
    slashCommands = Array.from(/* @__PURE__ */ new Set([...slashCommands, ...writeWorkflowFiles(claudeCmdDir)]));
    if (upsertRuleFile(rootDir, "CLAUDE.md")) rulesUpdated.push("CLAUDE.md");
  }
  if (agents.includes("antigravity")) {
    const agWorkflowDir = path.join(rootDir, ".agent", "workflows");
    slashCommands = Array.from(/* @__PURE__ */ new Set([...slashCommands, ...writeWorkflowFiles(agWorkflowDir)]));
    if (upsertRuleFile(rootDir, "GEMINI.md")) rulesUpdated.push("GEMINI.md");
  }
  if (agents.includes("cursor")) {
    const cursorRulesDir = path.join(rootDir, ".cursor", "rules");
    try {
      fs.mkdirSync(cursorRulesDir, { recursive: true });
      fs.writeFileSync(
        path.join(cursorRulesDir, "what-is-it.mdc"),
        `---
description: Live project memory protocol for what-is-it
globs: *
---
${AGENT_RULE_CONTENT.trim()}
`,
        "utf-8"
      );
    } catch {
    }
    if (upsertRuleFile(rootDir, ".cursorrules")) rulesUpdated.push(".cursorrules");
  }
  if (agents.includes("windsurf")) {
    if (upsertRuleFile(rootDir, ".windsurfrules")) rulesUpdated.push(".windsurfrules");
  }
  if (agents.includes("cline")) {
    if (upsertRuleFile(rootDir, ".clinerules")) rulesUpdated.push(".clinerules");
  }
  if (agents.includes("copilot")) {
    if (upsertRuleFile(rootDir, ".github/copilot-instructions.md")) rulesUpdated.push(".github/copilot-instructions.md");
  }
  if (agents.includes("agents-md")) {
    if (upsertRuleFile(rootDir, "AGENTS.md")) rulesUpdated.push("AGENTS.md");
  }
  return { skillPath, rulesUpdated, slashCommands };
}

// src/cli/server.ts
import http from "http";
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import open from "open";
import pc from "picocolors";
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};
function startServer(rootDir, port = 3456, shouldOpen = true) {
  const binPath = path2.resolve(rootDir, DEFAULT_FILE_NAME);
  if (!fs2.existsSync(binPath)) {
    console.error(pc.red(`Error: ${DEFAULT_FILE_NAME} not found in ${rootDir}. Run 'npx what-is-it init' first.`));
    process.exit(1);
  }
  const currentDir = path2.dirname(fileURLToPath(import.meta.url));
  let webDistDir = path2.resolve(currentDir, "..", "web");
  if (!fs2.existsSync(path2.join(webDistDir, "index.html"))) {
    const fallbackDir = path2.resolve(currentDir, "..", "..", "dist", "web");
    if (fs2.existsSync(path2.join(fallbackDir, "index.html"))) {
      webDistDir = fallbackDir;
    }
  }
  const sseClients = /* @__PURE__ */ new Set();
  function broadcastUpdate() {
    const message = `data: ${JSON.stringify({ timestamp: Date.now() })}

`;
    for (const client of sseClients) {
      try {
        client.write(message);
      } catch {
        sseClients.delete(client);
      }
    }
  }
  let watchDebounce = null;
  fs2.watch(rootDir, (eventType, filename) => {
    if (filename === DEFAULT_FILE_NAME) {
      if (watchDebounce) clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        broadcastUpdate();
      }, 150);
    }
  });
  function isTrustedOrigin(req) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const header = origin || referer;
    if (!header) return true;
    try {
      const url = new URL(header);
      return (url.hostname === "localhost" || url.hostname === "127.0.0.1") && Number(url.port) === port;
    } catch {
      return false;
    }
  }
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = parsedUrl.pathname;
    if (pathname.startsWith("/api/") && !isTrustedOrigin(req)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Cross-origin requests to the local what-is-it API are not allowed." }));
      return;
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });
      res.write('data: {"connected": true}\n\n');
      sseClients.add(res);
      req.on("close", () => {
        sseClients.delete(res);
      });
      return;
    }
    if (pathname === "/api/project" && req.method === "GET") {
      try {
        const data = loadProjectData(rootDir);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    if (pathname === "/api/project" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const incoming = JSON.parse(body);
          if (!validateProjectData(incoming)) {
            throw new Error("Payload does not match the expected project data shape");
          }
          saveProjectData(rootDir, incoming);
          broadcastUpdate();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (pathname === "/api/task/toggle" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const { taskId } = JSON.parse(body);
          const current = loadProjectData(rootDir);
          if (!current) throw new Error("Project data not found");
          const task = current.tasks?.find((t) => t.id === taskId);
          if (!task) throw new Error(`Task ${taskId} not found`);
          task.status = task.status === "done" ? "todo" : "done";
          if (task.status === "done") {
            task.completedAt = (/* @__PURE__ */ new Date()).toISOString();
          } else {
            delete task.completedAt;
          }
          if (task.subFeatureId) {
            for (const feature of current.features) {
              const sub = feature.subFeatures?.find((sf) => sf.id === task.subFeatureId);
              if (sub) {
                sub.status = task.status === "done" ? "implemented" : "missing";
                break;
              }
            }
          }
          saveProjectData(rootDir, current);
          broadcastUpdate();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, task }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    const safePath = path2.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path2.join(webDistDir, safePath === "/" || safePath === "" ? "index.html" : safePath);
    if (!fs2.existsSync(filePath) || fs2.statSync(filePath).isDirectory()) {
      filePath = path2.join(webDistDir, "index.html");
    }
    const resolvedPath = path2.resolve(filePath);
    const resolvedDist = path2.resolve(webDistDir);
    if (!resolvedPath.startsWith(resolvedDist)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Access denied");
      return;
    }
    if (fs2.existsSync(filePath) && fs2.statSync(filePath).isFile()) {
      const ext = path2.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs2.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Web bundle not found. Please ensure what-is-it web assets are built.");
    }
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(pc.yellow(`\u26A0\uFE0F Port ${port} is in use, attempting port ${port + 1}...`));
      startServer(rootDir, port + 1, shouldOpen);
    } else {
      console.error(pc.red(`Server error: ${err.message}`));
    }
  });
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`
${pc.bold(pc.green("\u{1F680} what-is-it web viewer running!"))}`);
    console.log(`   ${pc.bold("Local URL:")}     ${pc.cyan(url)}`);
    console.log(`   ${pc.bold("State File:")}    ${pc.dim(binPath)}`);
    console.log(`   ${pc.bold("Live Updates:")}  ${pc.magenta("Active (SSE)")}
`);
    if (shouldOpen) {
      open(url).catch(() => {
      });
    }
  });
  return server;
}

// src/cli/caveman.ts
import pc2 from "picocolors";
function formatCavemanStatus(data) {
  const { meta, features, tasks = [] } = data;
  const allSubFeatures = features.flatMap((f) => f.subFeatures || []);
  const hasSubFeatures = allSubFeatures.length > 0;
  const lines = [];
  lines.push(`${pc2.bold(pc2.yellow("UGG."))} PROJECT: ${pc2.cyan(meta.name)} [${pc2.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);
  if (hasSubFeatures) {
    const implementedCount = allSubFeatures.filter((s) => s.status === "implemented").length;
    const inProgress = allSubFeatures.filter((s) => s.status === "in_progress");
    const missing = allSubFeatures.filter((s) => s.status === "missing");
    lines.push(`SPECS: ${pc2.green(`${implementedCount}`)} IMPLEMENTED / ${pc2.yellow(`${inProgress.length}`)} ACTIVE / ${pc2.red(`${missing.length}`)} MISSING (TOTAL: ${allSubFeatures.length})`);
    lines.push("");
    lines.push(pc2.bold("FEATURES:"));
    for (const f of features) {
      const subs = f.subFeatures || [];
      const done = subs.filter((s) => s.status === "implemented").length;
      const statColor = f.status === "completed" ? pc2.green : f.status === "in_progress" ? pc2.yellow : pc2.dim;
      lines.push(`- [${statColor(`${f.progress}%`)}] ${pc2.bold(f.title)} (${done}/${subs.length} sub-features)`);
      if (f.missingDetails && f.missingDetails.whatsMissing?.length > 0) {
        lines.push(`  ${pc2.red("!")} GAPS: ${pc2.dim(f.missingDetails.whatsMissing.slice(0, 2).join("; "))}`);
      }
    }
    const focusItems = inProgress.length > 0 ? inProgress : missing.slice(0, 3);
    if (focusItems.length > 0) {
      lines.push("");
      lines.push(pc2.bold(pc2.yellow("WHAT'S MISSING & NEXT PLANNED WORK (DO NOW):")));
      for (const sf of focusItems) {
        const icon = sf.status === "in_progress" ? pc2.yellow("\u26A1") : pc2.red("!");
        lines.push(`${icon} [${pc2.cyan(sf.id)}] "${pc2.bold(sf.title)}" (${sf.status})`);
        lines.push(`  WHAT:  ${sf.what}`);
        lines.push(`  WHY:   ${sf.why}`);
        lines.push(`  WHERE: ${pc2.underline(sf.where)}`);
        lines.push(`  HOW:   ${sf.how}`);
        lines.push(`  WHEN:  ${sf.when}`);
      }
    }
  } else {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const todo = tasks.filter((t) => t.status === "todo");
    lines.push(`TASKS: ${pc2.green(`${done}`)} DONE / ${pc2.yellow(`${inProgress.length}`)} ACTIVE / ${pc2.white(`${todo.length}`)} TODO (TOTAL: ${total})`);
    lines.push("");
    lines.push(pc2.bold("FEATURES:"));
    for (const f of features) {
      const fTasks = tasks.filter((t) => t.featureId === f.id);
      const fDone = fTasks.filter((t) => t.status === "done").length;
      const statColor = f.status === "completed" ? pc2.green : f.status === "in_progress" ? pc2.yellow : pc2.dim;
      lines.push(`- [${statColor(`${f.progress}%`)}] ${pc2.bold(f.title)} (${fDone}/${fTasks.length} tasks)`);
    }
    if (inProgress.length > 0) {
      lines.push("");
      lines.push(pc2.bold(pc2.yellow("CURRENT FOCUS (DO NOW):")));
      for (const t of inProgress) {
        lines.push(`* [${pc2.cyan(t.id)}] "${pc2.bold(t.title)}"`);
        lines.push(`  WHY:   ${t.why}`);
        lines.push(`  WHERE: ${pc2.underline(t.where)}`);
        lines.push(`  HOW:   ${t.how}`);
        lines.push(`  WHEN:  ${t.when}`);
      }
    }
  }
  lines.push("");
  lines.push(`${pc2.dim("AGENT COMMANDS:")}`);
  lines.push(`- Check status:  ${pc2.cyan("npx what-is-it status")}`);
  lines.push(`- Inspect specs: ${pc2.cyan("npx what-is-it schema")}`);
  lines.push(`- Open UI:       ${pc2.cyan("npx what-is-it")}`);
  return lines.join("\n");
}
function formatCavemanSuccess(action, id, detail) {
  let msg = `${pc2.bold(pc2.yellow("UGG."))} ${pc2.green(action.toUpperCase())}`;
  if (id) msg += ` [${pc2.cyan(id)}]`;
  if (detail) msg += ` - ${detail}`;
  return msg;
}
function formatCavemanError(err) {
  return `${pc2.bold(pc2.red("GRR."))} ERROR: ${err}. RUN ${pc2.cyan("npx what-is-it status")} TO CHECK.`;
}

// src/cli/index.ts
var program = new Command();
program.name("what-is-it").description("Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding").version("1.1.1");
function askQuestion(query) {
  if (!process.stdin.isTTY) return Promise.resolve("");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
async function resolveAgentTargets(rawFlag) {
  const fromFlag = parseAgentTargets(rawFlag);
  if (fromFlag) return fromFlag;
  if (!process.stdin.isTTY) return DEFAULT_AGENT_TARGETS;
  console.log(`
${pc3.cyan("?")} Which AI agent(s)/IDE(s) do you use? (comma-separated numbers, or "all")`);
  AGENT_TARGETS.forEach((t, i) => {
    console.log(`   ${pc3.bold(String(i + 1))}. ${t.label} ${pc3.dim(`\u2014 ${t.installs}`)}`);
  });
  const answer = await askQuestion(`   ${pc3.dim(`[default: ${DEFAULT_AGENT_TARGETS.join(", ")}]`)} > `);
  if (!answer) return DEFAULT_AGENT_TARGETS;
  if (answer.trim().toLowerCase() === "all") return AGENT_TARGETS.map((t) => t.id);
  const chosen = answer.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= AGENT_TARGETS.length).map((n) => AGENT_TARGETS[n - 1].id);
  return chosen.length > 0 ? Array.from(new Set(chosen)) : DEFAULT_AGENT_TARGETS;
}
program.command("ui", { isDefault: true }).description("Launch the live interactive web viewer").option("-p, --port <number>", "Port to listen on", "3456").option("--no-open", "Do not open browser automatically").action((options) => {
  const cwd = process.cwd();
  if (!projectExists(cwd)) {
    console.log(pc3.yellow(`No ${DEFAULT_FILE_NAME} found in current directory.`));
    console.log(`Running auto-mapping initialization first...
`);
    runInit(cwd, { force: false, open: options.open });
    return;
  }
  const port = parseInt(options.port, 10) || 3456;
  startServer(cwd, port, options.open !== false);
});
program.command("init").description("Map the existing codebase, create .what-is-it.bin, and install agent skills").option("-f, --force", "Overwrite existing state if already initialized").option("--agents <list>", `Comma-separated agent targets to install (${AGENT_TARGETS.map((t) => t.id).join(", ")}, or "all"); prompts interactively if omitted`).action((options) => {
  runInit(process.cwd(), options);
});
async function runInit(cwd, options = {}) {
  if (projectExists(cwd) && !options.force) {
    console.log(pc3.yellow(`\u26A0\uFE0F ${DEFAULT_FILE_NAME} already exists in ${cwd}.`));
    console.log(`Use ${pc3.cyan("--force")} to overwrite, or run ${pc3.cyan("npx what-is-it")} to open viewer.`);
    return;
  }
  console.log(pc3.bold(pc3.cyan("\n\u{1F50D} Mapping project codebase & architecture...")));
  const scanContext = scanProject(cwd);
  console.log(`- Project Name: ${pc3.bold(scanContext.projectName)}`);
  console.log(`- Project Type: ${pc3.bold(scanContext.projectType)}`);
  console.log(`- Frameworks:   ${scanContext.frameworks.join(", ") || "Custom"}`);
  console.log(`- Discovered:   ${scanContext.files.length} files, ${scanContext.routes.length} routes, ${scanContext.components.length} components`);
  const projectData = synthesizeProjectData(scanContext);
  const { binPath, mdPath } = saveProjectData(cwd, projectData);
  console.log(pc3.green(`\u2714 Saved compressed binary: ${binPath} (${fs3.statSync(binPath).size} bytes)`));
  if (mdPath) {
    console.log(pc3.green(`\u2714 Generated markdown overview: ${mdPath}`));
  }
  const agents = await resolveAgentTargets(options.agents);
  const { skillPath, rulesUpdated, slashCommands } = installSkills({
    rootDir: cwd,
    meta: projectData.meta,
    agents
  });
  if (skillPath) {
    console.log(pc3.green(`\u2714 Installed project-specific skill: ${skillPath}`));
  }
  if (slashCommands.length > 0) {
    console.log(pc3.green(`\u2714 Installed native slash commands: ${slashCommands.join(", ")}`));
  }
  if (rulesUpdated.length > 0) {
    console.log(pc3.green(`\u2714 Updated multi-agent rules: ${rulesUpdated.join(", ")}`));
  }
  console.log("\n" + pc3.bold(pc3.cyan("\u2550".repeat(68))));
  console.log(pc3.bold(pc3.green("  \u{1F389} what-is-it project memory initialized successfully!")));
  console.log(pc3.bold(pc3.cyan("\u2550".repeat(68))));
  console.log(`
${pc3.bold(pc3.yellow("\u{1F449} NEXT STEP (DELEGATE TO YOUR AI AGENT):"))}`);
  if (slashCommands.includes("/wii-init")) {
    console.log(`   Open your AI Agent chat and type:`);
    console.log(`   ${pc3.bold(pc3.magenta("/wii-init"))}`);
    console.log(`   ${pc3.dim("-> Your agent will analyze the codebase and formulate deep domain tasks & user flows.")}
`);
    if (slashCommands.includes("/wii-status")) {
      console.log(`   ${pc3.bold(pc3.cyan("/wii-status"))}     - Check active tasks and progress anytime`);
    }
    if (slashCommands.includes("/wii-task-done")) {
      console.log(`   ${pc3.bold(pc3.cyan("/wii-task-done"))}  - Mark tasks done as you code`);
    }
  } else {
    console.log(`   Tell your AI agent to read the project instructions installed above (${rulesUpdated.join(", ") || "your rule file"})`);
    console.log(`   and do a deep pass: read the real code, replace the baseline with verified features and`);
    console.log(`   user flows, then run ${pc3.cyan("npx what-is-it import <file.json>")} with the result.
`);
  }
  console.log(`   ${pc3.bold(pc3.cyan("npx what-is-it"))} - Open the live web viewer in your browser
`);
  console.log(pc3.bold(pc3.cyan("\u2550".repeat(68))) + "\n");
}
program.command("status").description("Print concise caveman-style project status and active tasks for agents").action(() => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found. Run 'npx what-is-it init' first.`));
    process.exit(1);
  }
  console.log(formatCavemanStatus(data));
});
program.command("schema").description("Print the complete JSON schema for what-is-it project state (ideal for AI agents)").action(() => {
  console.log(JSON.stringify(getProjectJsonSchema(), null, 2));
});
program.command("install-skill").description("Install this project's agent skill, rules, and slash commands").option("--agents <list>", `Comma-separated agent targets to install (${AGENT_TARGETS.map((t) => t.id).join(", ")}, or "all"); prompts interactively if omitted`).action(async (options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  const agents = await resolveAgentTargets(options.agents);
  const { skillPath, rulesUpdated, slashCommands } = installSkills({
    rootDir: cwd,
    meta: data?.meta,
    agents
  });
  if (skillPath) {
    console.log(pc3.green(`\u2714 Installed project-specific skill: ${skillPath}`));
  }
  if (slashCommands.length > 0) {
    console.log(pc3.green(`\u2714 Installed slash commands: ${slashCommands.join(", ")}`));
  }
  if (rulesUpdated.length > 0) {
    console.log(pc3.green(`\u2714 Updated rules: ${rulesUpdated.join(", ")}`));
  }
});
var taskCmd = program.command("task").description("Manage project tasks");
taskCmd.command("add").description("Add a new task to the project").requiredOption("--title <string>", "Task title").option("--feature <string>", "Feature ID (defaults to first feature)").option("--why <string>", "Rationale / problem solved", "Improve codebase and user experience").option("--how <string>", "Technical approach / implementation details", "Implement required code and tests").option("--where <string>", "Files or routes touched", "src/").option("--when <string>", "Milestone / phase", "Current Sprint").option("--priority <priority>", "Priority (low, medium, high, urgent)", "medium").option("--role <role>", "Actor role", "Developer").action((options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  const featureId = options.feature || (data.features[0]?.id || "core");
  const taskId = `task-${data.tasks.length + 1}-${Math.random().toString(36).slice(2, 6)}`;
  const newTask = {
    id: taskId,
    featureId,
    title: options.title,
    status: "todo",
    priority: options.priority || "medium",
    actorRole: options.role || "Developer",
    why: options.why,
    how: options.how,
    where: options.where,
    when: options.when,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.tasks.push(newTask);
  saveProjectData(cwd, data);
  console.log(formatCavemanSuccess("TASK ADDED", taskId, `"${newTask.title}" in ${featureId}`));
});
taskCmd.command("done <taskId>").description("Mark a task as completed").action((taskId) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  const task = data.tasks.find((t) => t.id === taskId || t.id.toLowerCase() === taskId.toLowerCase());
  if (!task) {
    console.error(formatCavemanError(`Task ${taskId} not found`));
    process.exit(1);
  }
  task.status = "done";
  task.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (task.subFeatureId) {
    const feature = data.features.find((f) => f.id === task.featureId);
    const sub = feature?.subFeatures?.find((sf) => sf.id === task.subFeatureId);
    if (sub) sub.status = "implemented";
  }
  saveProjectData(cwd, data);
  const updated = loadProjectData(cwd) ?? data;
  console.log(formatCavemanSuccess("TASK COMPLETED", task.id, `"${task.title}"`));
  console.log(`${pc3.dim("Progress now:")} ${pc3.green(`${updated.meta.overallProgress}%`)}`);
});
taskCmd.command("list").description("List all tasks").option("--status <status>", "Filter by status (todo, in_progress, done)").action((options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  let filtered = data.tasks;
  if (options.status) {
    filtered = filtered.filter((t) => t.status === options.status);
  }
  console.log(pc3.bold(`
TASKS (${filtered.length} total):`));
  for (const t of filtered) {
    const icon = t.status === "done" ? pc3.green("\u2714") : t.status === "in_progress" ? pc3.yellow("\u26A1") : pc3.dim("\u25CB");
    console.log(`${icon} [${pc3.cyan(t.id)}] ${pc3.bold(t.title)} (${t.status})`);
    console.log(`    WHERE: ${pc3.underline(t.where)} | WHY: ${t.why}`);
  }
  console.log("");
});
var featCmd = program.command("feature").description("Manage project features");
featCmd.command("add").description("Add a new feature group").requiredOption("--id <string>", "Unique feature ID").requiredOption("--title <string>", "Feature title").option("--desc <string>", "Feature description", "").option("--category <string>", "Feature category", "General").action((options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  if (data.features.some((f) => f.id === options.id)) {
    console.error(formatCavemanError(`Feature ID "${options.id}" already exists`));
    process.exit(1);
  }
  const newFeature = {
    id: options.id,
    title: options.title,
    description: options.desc,
    category: options.category,
    status: "planned",
    progress: 0,
    order: data.features.length + 1
  };
  data.features.push(newFeature);
  saveProjectData(cwd, data);
  console.log(formatCavemanSuccess("FEATURE ADDED", options.id, `"${options.title}"`));
});
program.command("export").description("Export project data to JSON or Markdown").option("--format <format>", "Export format (json or md)", "json").action((options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  if (options.format === "md") {
    console.log(generateMarkdownOverview(data));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
});
program.command("import <file>").description("Import project data from a JSON file into .what-is-it.bin and clean up scratch files").option("--no-clean", "Do not remove scratch state file after import").action((filePath, options) => {
  const cwd = process.cwd();
  const fullPath = path3.resolve(cwd, filePath);
  if (!fs3.existsSync(fullPath)) {
    console.error(formatCavemanError(`File ${filePath} not found`));
    process.exit(1);
  }
  try {
    const raw = fs3.readFileSync(fullPath, "utf-8");
    const incoming = JSON.parse(raw);
    if (!validateProjectData(incoming)) {
      console.error(formatCavemanError("Import file does not match the expected project data shape. Run `npx what-is-it schema` to inspect the required structure."));
      process.exit(1);
    }
    saveProjectData(cwd, incoming);
    console.log(formatCavemanSuccess("PROJECT DATA IMPORTED", path3.basename(filePath)));
    const isScratch = filePath.includes("scratch") || fullPath.includes("/scratch/");
    if (isScratch && options.clean !== false) {
      try {
        fs3.unlinkSync(fullPath);
        console.log(pc3.dim(`\u2714 Cleaned up scratch state file: ${filePath}`));
        const parentDir = path3.dirname(fullPath);
        if (path3.basename(parentDir) === "scratch") {
          const remaining = fs3.readdirSync(parentDir);
          if (remaining.length === 0) {
            fs3.rmdirSync(parentDir);
            console.log(pc3.dim(`\u2714 Pruned empty scratch directory`));
          }
        }
      } catch {
      }
    }
  } catch (err) {
    console.error(formatCavemanError(`Import failed: ${err.message}`));
    process.exit(1);
  }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map