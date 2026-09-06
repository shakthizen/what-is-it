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
} from "../chunk-CXGKVEMC.js";

// src/cli/index.ts
import { Command } from "commander";
import path3 from "path";
import fs3 from "fs";
import readline from "readline";
import pc4 from "picocolors";

// src/cli/skills.ts
import fs from "fs";
import path from "path";
import os from "os";
import pc from "picocolors";
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
- \`init\` already wrote a static, best-effort baseline (file-path pattern matching only, no code read) \u2014 export it first with \`npx @shakthizen/what-is-it export --format json\` to see what it found.
- When user runs \`/what-is-it-init\` in chat, do the deep pass in this order \u2014 do not skip ahead to step 2 before step 1 is done:
  1. **Verify & correct the real feature set and user flows first**, independent of anything missing/broken/insecure. Actually read the routes, components, services, and domain models; replace the baseline's generic "discovered file" sub-features with real \`why\`/\`how\` rationale, real actor roles, and real user flows/edges that reflect how the app is actually used.
  2. For each screen in a flow, generate a real per-screen mockup as inline SVG and put it in \`FlowNode.data.mockupSvg\` (a single \`<svg>...</svg>\` string reflecting that screen's actual layout) instead of leaving it to the generic built-in wireframe template.
  3. **Only after** the real feature/flow model is accurate, layer in what's missing: gaps, bugs, and security issues you find \u2014 as separate \`missingDetails\` / additional sub-features explicitly marked \`status: "missing"\`, never mixed into the "what actually exists" inventory from step 1.
  4. Run \`npx @shakthizen/what-is-it schema\` if you need the exact JSON schema.
  5. Save the synthesized state to a temporary JSON file (e.g. \`scratch/what-is-it-state.json\`).
  6. Execute: \`npx @shakthizen/what-is-it import scratch/what-is-it-state.json\`.
  7. Run \`npx @shakthizen/what-is-it status\` to confirm.

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
function installSkills(options) {
  const { rootDir } = options;
  const rulesUpdated = [];
  const slashCommands = [];
  const skillDir = path.join(rootDir, ".agents", "skills", "what-is-it");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, "SKILL.md");
  const skillContent = generateDynamicSkill(options);
  fs.writeFileSync(skillPath, skillContent, "utf-8");
  const agWorkflowDir = path.join(rootDir, ".agent", "workflows");
  fs.mkdirSync(agWorkflowDir, { recursive: true });
  fs.writeFileSync(
    path.join(agWorkflowDir, "what-is-it-init.md"),
    `---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect. \`init\` already wrote a static, file-path-only baseline
(no code was read) \u2014 run \`npx @shakthizen/what-is-it export --format json\` to see it. Your job
is to replace it with a verified model, in this strict order:

**Phase 1 \u2014 Get the real feature set and user flows right, independent of anything missing or broken.**
1. Actually read the codebase (routes, components, services, domain models, README) \u2014 don't rely
   on the baseline's generic "file discovered" sub-features.
2. Identify real actor roles (e.g. Guest, Authenticated User, Admin) and group real features
   logically, each with genuine Why/How/Where/When rationale.
3. Build real user flows (React Flow nodes/edges) that reflect how the app is actually used.
4. For each screen node, generate a real per-screen mockup as inline SVG and set it on
   \`FlowNode.data.mockupSvg\` \u2014 a single \`<svg>...</svg>\` string reflecting that screen's actual
   layout \u2014 instead of leaving the generic built-in wireframe template as the only option.
5. Write multi-page Wiki documentation with bookmarks describing this verified architecture.

**Phase 2 \u2014 Only now, layer in what's missing.**
6. Flag genuinely missing features, bugs, and security issues you find as explicit
   \`status: "missing"\` sub-features / \`missingDetails\`, kept separate from the "what actually
   exists" model built in Phase 1 \u2014 never conflate a real feature with a wishlist item.

**Commit it:**
7. Check the schema with \`npx @shakthizen/what-is-it schema\` if needed.
8. Write the comprehensive JSON to a temporary file (e.g. \`scratch/what-is-it-state.json\`).
9. Execute: \`npx @shakthizen/what-is-it import scratch/what-is-it-state.json\`.
10. Run \`npx @shakthizen/what-is-it status\` to verify.
`,
    "utf-8"
  );
  slashCommands.push("/what-is-it-init");
  fs.writeFileSync(
    path.join(agWorkflowDir, "status.md"),
    `---
description: Check live project memory status, progress percentage, and active tasks
---

Run \`npx @shakthizen/what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
`,
    "utf-8"
  );
  slashCommands.push("/status");
  fs.writeFileSync(
    path.join(agWorkflowDir, "task-done.md"),
    `---
description: Mark a task as completed in what-is-it project memory
---

Mark the task complete:
Run \`npx @shakthizen/what-is-it task done <task-id>\`.
If no task ID is provided, look at recently completed work, find the matching task ID, mark it done, and report updated overall progress.
`,
    "utf-8"
  );
  slashCommands.push("/task-done");
  fs.writeFileSync(
    path.join(agWorkflowDir, "what-is-it.md"),
    `---
description: Review high-level project architecture, features, and launch the web viewer
---

1. Run \`npx @shakthizen/what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx @shakthizen/what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
`,
    "utf-8"
  );
  slashCommands.push("/what-is-it");
  const claudeCmdDir = path.join(rootDir, ".claude", "commands");
  try {
    fs.mkdirSync(claudeCmdDir, { recursive: true });
    fs.copyFileSync(path.join(agWorkflowDir, "what-is-it-init.md"), path.join(claudeCmdDir, "what-is-it-init.md"));
    fs.copyFileSync(path.join(agWorkflowDir, "status.md"), path.join(claudeCmdDir, "status.md"));
    fs.copyFileSync(path.join(agWorkflowDir, "task-done.md"), path.join(claudeCmdDir, "task-done.md"));
    fs.copyFileSync(path.join(agWorkflowDir, "what-is-it.md"), path.join(claudeCmdDir, "what-is-it.md"));
  } catch {
  }
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
  const ruleFiles = [
    "AGENTS.md",
    "GEMINI.md",
    "CLAUDE.md",
    ".cursorrules",
    ".windsurfrules",
    ".clinerules",
    ".github/copilot-instructions.md"
  ];
  for (const file of ruleFiles) {
    const rulePath = path.join(rootDir, file);
    const parentDir = path.dirname(rulePath);
    if (!fs.existsSync(parentDir)) {
      try {
        fs.mkdirSync(parentDir, { recursive: true });
      } catch {
        continue;
      }
    }
    if (fs.existsSync(rulePath)) {
      const existing = fs.readFileSync(rulePath, "utf-8");
      if (existing.includes(AGENT_RULE_MARKER)) {
        const regex = /<!-- WHAT_IS_IT_START -->[\s\S]*?<!-- WHAT_IS_IT_END -->/g;
        const updated = existing.replace(regex, AGENT_RULE_CONTENT.trim());
        fs.writeFileSync(rulePath, updated, "utf-8");
        rulesUpdated.push(file);
      } else {
        fs.writeFileSync(rulePath, existing + "\n" + AGENT_RULE_CONTENT, "utf-8");
        rulesUpdated.push(file);
      }
    } else if (file === "AGENTS.md" || file === "CLAUDE.md" || file === ".cursorrules") {
      fs.writeFileSync(rulePath, AGENT_RULE_CONTENT.trim() + "\n", "utf-8");
      rulesUpdated.push(file);
    }
  }
  return { skillPath, rulesUpdated, slashCommands };
}
function installGlobalSkill() {
  try {
    const homeDir = os.homedir();
    const globalSkillDir = path.join(homeDir, ".gemini", "config", "skills", "what-is-it");
    fs.mkdirSync(globalSkillDir, { recursive: true });
    const globalSkillPath = path.join(globalSkillDir, "SKILL.md");
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
    fs.writeFileSync(globalSkillPath, globalContent, "utf-8");
    return { globalSkillPath, success: true };
  } catch (err) {
    console.error(pc.red(`Failed to install global skill: ${err.message}`));
    return { globalSkillPath: "", success: false };
  }
}

// src/cli/server.ts
import http from "http";
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import open from "open";
import pc2 from "picocolors";
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
    console.error(pc2.red(`Error: ${DEFAULT_FILE_NAME} not found in ${rootDir}. Run 'npx @shakthizen/what-is-it init' first.`));
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
      console.log(pc2.yellow(`\u26A0\uFE0F Port ${port} is in use, attempting port ${port + 1}...`));
      startServer(rootDir, port + 1, shouldOpen);
    } else {
      console.error(pc2.red(`Server error: ${err.message}`));
    }
  });
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`
${pc2.bold(pc2.green("\u{1F680} what-is-it web viewer running!"))}`);
    console.log(`   ${pc2.bold("Local URL:")}     ${pc2.cyan(url)}`);
    console.log(`   ${pc2.bold("State File:")}    ${pc2.dim(binPath)}`);
    console.log(`   ${pc2.bold("Live Updates:")}  ${pc2.magenta("Active (SSE)")}
`);
    if (shouldOpen) {
      open(url).catch(() => {
      });
    }
  });
  return server;
}

// src/cli/caveman.ts
import pc3 from "picocolors";
function formatCavemanStatus(data) {
  const { meta, features, tasks = [] } = data;
  const allSubFeatures = features.flatMap((f) => f.subFeatures || []);
  const hasSubFeatures = allSubFeatures.length > 0;
  const lines = [];
  lines.push(`${pc3.bold(pc3.yellow("UGG."))} PROJECT: ${pc3.cyan(meta.name)} [${pc3.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);
  if (hasSubFeatures) {
    const implementedCount = allSubFeatures.filter((s) => s.status === "implemented").length;
    const inProgress = allSubFeatures.filter((s) => s.status === "in_progress");
    const missing = allSubFeatures.filter((s) => s.status === "missing");
    lines.push(`SPECS: ${pc3.green(`${implementedCount}`)} IMPLEMENTED / ${pc3.yellow(`${inProgress.length}`)} ACTIVE / ${pc3.red(`${missing.length}`)} MISSING (TOTAL: ${allSubFeatures.length})`);
    lines.push("");
    lines.push(pc3.bold("FEATURES:"));
    for (const f of features) {
      const subs = f.subFeatures || [];
      const done = subs.filter((s) => s.status === "implemented").length;
      const statColor = f.status === "completed" ? pc3.green : f.status === "in_progress" ? pc3.yellow : pc3.dim;
      lines.push(`- [${statColor(`${f.progress}%`)}] ${pc3.bold(f.title)} (${done}/${subs.length} sub-features)`);
      if (f.missingDetails && f.missingDetails.whatsMissing?.length > 0) {
        lines.push(`  ${pc3.red("!")} GAPS: ${pc3.dim(f.missingDetails.whatsMissing.slice(0, 2).join("; "))}`);
      }
    }
    const focusItems = inProgress.length > 0 ? inProgress : missing.slice(0, 3);
    if (focusItems.length > 0) {
      lines.push("");
      lines.push(pc3.bold(pc3.yellow("WHAT'S MISSING & NEXT PLANNED WORK (DO NOW):")));
      for (const sf of focusItems) {
        const icon = sf.status === "in_progress" ? pc3.yellow("\u26A1") : pc3.red("!");
        lines.push(`${icon} [${pc3.cyan(sf.id)}] "${pc3.bold(sf.title)}" (${sf.status})`);
        lines.push(`  WHAT:  ${sf.what}`);
        lines.push(`  WHY:   ${sf.why}`);
        lines.push(`  WHERE: ${pc3.underline(sf.where)}`);
        lines.push(`  HOW:   ${sf.how}`);
        lines.push(`  WHEN:  ${sf.when}`);
      }
    }
  } else {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const todo = tasks.filter((t) => t.status === "todo");
    lines.push(`TASKS: ${pc3.green(`${done}`)} DONE / ${pc3.yellow(`${inProgress.length}`)} ACTIVE / ${pc3.white(`${todo.length}`)} TODO (TOTAL: ${total})`);
    lines.push("");
    lines.push(pc3.bold("FEATURES:"));
    for (const f of features) {
      const fTasks = tasks.filter((t) => t.featureId === f.id);
      const fDone = fTasks.filter((t) => t.status === "done").length;
      const statColor = f.status === "completed" ? pc3.green : f.status === "in_progress" ? pc3.yellow : pc3.dim;
      lines.push(`- [${statColor(`${f.progress}%`)}] ${pc3.bold(f.title)} (${fDone}/${fTasks.length} tasks)`);
    }
    if (inProgress.length > 0) {
      lines.push("");
      lines.push(pc3.bold(pc3.yellow("CURRENT FOCUS (DO NOW):")));
      for (const t of inProgress) {
        lines.push(`* [${pc3.cyan(t.id)}] "${pc3.bold(t.title)}"`);
        lines.push(`  WHY:   ${t.why}`);
        lines.push(`  WHERE: ${pc3.underline(t.where)}`);
        lines.push(`  HOW:   ${t.how}`);
        lines.push(`  WHEN:  ${t.when}`);
      }
    }
  }
  lines.push("");
  lines.push(`${pc3.dim("AGENT COMMANDS:")}`);
  lines.push(`- Check status:  ${pc3.cyan("npx @shakthizen/what-is-it status")}`);
  lines.push(`- Inspect specs: ${pc3.cyan("npx @shakthizen/what-is-it schema")}`);
  lines.push(`- Open UI:       ${pc3.cyan("npx @shakthizen/what-is-it")}`);
  return lines.join("\n");
}
function formatCavemanSuccess(action, id, detail) {
  let msg = `${pc3.bold(pc3.yellow("UGG."))} ${pc3.green(action.toUpperCase())}`;
  if (id) msg += ` [${pc3.cyan(id)}]`;
  if (detail) msg += ` - ${detail}`;
  return msg;
}
function formatCavemanError(err) {
  return `${pc3.bold(pc3.red("GRR."))} ERROR: ${err}. RUN ${pc3.cyan("npx @shakthizen/what-is-it status")} TO CHECK.`;
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
      resolve(answer.trim().toLowerCase());
    });
  });
}
program.command("ui", { isDefault: true }).description("Launch the live interactive web viewer").option("-p, --port <number>", "Port to listen on", "3456").option("--no-open", "Do not open browser automatically").action((options) => {
  const cwd = process.cwd();
  if (!projectExists(cwd)) {
    console.log(pc4.yellow(`No ${DEFAULT_FILE_NAME} found in current directory.`));
    console.log(`Running auto-mapping initialization first...
`);
    runInit(cwd, { force: false, open: options.open });
    return;
  }
  const port = parseInt(options.port, 10) || 3456;
  startServer(cwd, port, options.open !== false);
});
program.command("init").description("Map the existing codebase, create .what-is-it.bin, and install agent skills").option("-f, --force", "Overwrite existing state if already initialized").option("-g, --global", "Install agent skill globally for all projects").option("--no-global", "Do not install skill globally").action((options) => {
  runInit(process.cwd(), options);
});
async function runInit(cwd, options = {}) {
  if (projectExists(cwd) && !options.force) {
    console.log(pc4.yellow(`\u26A0\uFE0F ${DEFAULT_FILE_NAME} already exists in ${cwd}.`));
    console.log(`Use ${pc4.cyan("--force")} to overwrite, or run ${pc4.cyan("npx @shakthizen/what-is-it")} to open viewer.`);
    return;
  }
  console.log(pc4.bold(pc4.cyan("\n\u{1F50D} Mapping project codebase & architecture...")));
  const scanContext = scanProject(cwd);
  console.log(`- Project Name: ${pc4.bold(scanContext.projectName)}`);
  console.log(`- Project Type: ${pc4.bold(scanContext.projectType)}`);
  console.log(`- Frameworks:   ${scanContext.frameworks.join(", ") || "Custom"}`);
  console.log(`- Discovered:   ${scanContext.files.length} files, ${scanContext.routes.length} routes, ${scanContext.components.length} components`);
  const projectData = synthesizeProjectData(scanContext);
  const { binPath, mdPath } = saveProjectData(cwd, projectData);
  console.log(pc4.green(`\u2714 Saved compressed binary: ${binPath} (${fs3.statSync(binPath).size} bytes)`));
  if (mdPath) {
    console.log(pc4.green(`\u2714 Generated markdown overview: ${mdPath}`));
  }
  const { skillPath, rulesUpdated, slashCommands } = installSkills({
    rootDir: cwd,
    meta: projectData.meta
  });
  console.log(pc4.green(`\u2714 Installed project-specific skill: ${skillPath}`));
  console.log(pc4.green(`\u2714 Installed native slash commands: ${slashCommands.join(", ")}`));
  if (rulesUpdated.length > 0) {
    console.log(pc4.green(`\u2714 Updated multi-agent rules: ${rulesUpdated.join(", ")}`));
  }
  let shouldInstallGlobal = options.global === true;
  if (!shouldInstallGlobal && options.global !== false && process.stdin.isTTY) {
    const answer = await askQuestion(`
${pc4.cyan("?")} Install what-is-it skill globally for all projects on this machine? (Y/n) `);
    if (answer === "" || answer === "y" || answer === "yes") {
      shouldInstallGlobal = true;
    }
  }
  if (shouldInstallGlobal) {
    const { globalSkillPath, success } = installGlobalSkill();
    if (success) {
      console.log(pc4.green(`\u2714 Installed global agent skill: ${globalSkillPath}`));
    }
  }
  console.log("\n" + pc4.bold(pc4.cyan("\u2550".repeat(68))));
  console.log(pc4.bold(pc4.green("  \u{1F389} what-is-it project memory initialized successfully!")));
  console.log(pc4.bold(pc4.cyan("\u2550".repeat(68))));
  console.log(`
${pc4.bold(pc4.yellow("\u{1F449} NEXT STEP (DELEGATE TO YOUR AI AGENT):"))}`);
  console.log(`   Open your AI Agent chat (Antigravity, Cursor, Claude Code) and type:`);
  console.log(`   ${pc4.bold(pc4.magenta("/what-is-it-init"))}`);
  console.log(`   ${pc4.dim("-> Your agent will analyze the codebase and formulate deep domain tasks & user flows.")}
`);
  console.log(`   ${pc4.bold(pc4.cyan("/status"))}        - Check active tasks and progress anytime`);
  console.log(`   ${pc4.bold(pc4.cyan("/task-done"))}     - Mark tasks done as you code`);
  console.log(`   ${pc4.bold(pc4.cyan("npx @shakthizen/what-is-it"))} - Open the live web viewer in your browser
`);
  console.log(pc4.bold(pc4.cyan("\u2550".repeat(68))) + "\n");
}
program.command("status").description("Print concise caveman-style project status and active tasks for agents").action(() => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found. Run 'npx @shakthizen/what-is-it init' first.`));
    process.exit(1);
  }
  console.log(formatCavemanStatus(data));
});
program.command("schema").description("Print the complete JSON schema for what-is-it project state (ideal for AI agents)").action(() => {
  console.log(JSON.stringify(getProjectJsonSchema(), null, 2));
});
program.command("install-skill").description("Install agent skills, rules, and slash commands").option("-g, --global", "Install globally into user config directory").action((options) => {
  const cwd = process.cwd();
  if (options.global) {
    const { globalSkillPath, success } = installGlobalSkill();
    if (success) {
      console.log(pc4.green(`\u2714 Installed global agent skill: ${globalSkillPath}`));
    }
  } else {
    const data = loadProjectData(cwd);
    const { skillPath, rulesUpdated, slashCommands } = installSkills({
      rootDir: cwd,
      meta: data?.meta
    });
    console.log(pc4.green(`\u2714 Installed project-specific skill: ${skillPath}`));
    console.log(pc4.green(`\u2714 Installed slash commands: ${slashCommands.join(", ")}`));
    if (rulesUpdated.length > 0) {
      console.log(pc4.green(`\u2714 Updated rules: ${rulesUpdated.join(", ")}`));
    }
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
  console.log(`${pc4.dim("Progress now:")} ${pc4.green(`${updated.meta.overallProgress}%`)}`);
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
  console.log(pc4.bold(`
TASKS (${filtered.length} total):`));
  for (const t of filtered) {
    const icon = t.status === "done" ? pc4.green("\u2714") : t.status === "in_progress" ? pc4.yellow("\u26A1") : pc4.dim("\u25CB");
    console.log(`${icon} [${pc4.cyan(t.id)}] ${pc4.bold(t.title)} (${t.status})`);
    console.log(`    WHERE: ${pc4.underline(t.where)} | WHY: ${t.why}`);
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
      console.error(formatCavemanError("Import file does not match the expected project data shape. Run `npx @shakthizen/what-is-it schema` to inspect the required structure."));
      process.exit(1);
    }
    saveProjectData(cwd, incoming);
    console.log(formatCavemanSuccess("PROJECT DATA IMPORTED", path3.basename(filePath)));
    const isScratch = filePath.includes("scratch") || fullPath.includes("/scratch/");
    if (isScratch && options.clean !== false) {
      try {
        fs3.unlinkSync(fullPath);
        console.log(pc4.dim(`\u2714 Cleaned up scratch state file: ${filePath}`));
        const parentDir = path3.dirname(fullPath);
        if (path3.basename(parentDir) === "scratch") {
          const remaining = fs3.readdirSync(parentDir);
          if (remaining.length === 0) {
            fs3.rmdirSync(parentDir);
            console.log(pc4.dim(`\u2714 Pruned empty scratch directory`));
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