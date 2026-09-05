import {
  DEFAULT_FILE_NAME,
  generateMarkdownOverview,
  getProjectJsonSchema,
  loadProjectData,
  projectExists,
  saveProjectData,
  scanProject,
  synthesizeProjectData
} from "../chunk-AGAEX34J.js";

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
var AGENT_RULE_MARKER = "<!-- WHAT_IS_IT_START -->";
var AGENT_RULE_CONTENT = `
<!-- WHAT_IS_IT_START -->
## Project Memory Protocol (what-is-it)
Ugg. This project tracks live memory with \`what-is-it\`.
- Start session: run \`npx what-is-it status\` to see active tasks and target files.
- Finish task: run \`npx what-is-it task done <task-id>\`.
- Keep \`.what-is-it.bin\` live and fresh.
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
    "utf-8"
  );
  slashCommands.push("/what-is-it-init");
  fs.writeFileSync(
    path.join(agWorkflowDir, "status.md"),
    `---
description: Check live project memory status, progress percentage, and active tasks
---

Run \`npx what-is-it status\` in the terminal and summarize the current focus task, why doing it, and target files.
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
Run \`npx what-is-it task done <task-id>\`.
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

1. Run \`npx what-is-it status\` to inspect current project status.
2. Tell the user to run \`npx what-is-it\` in terminal if they wish to open the live interactive dashboard and React Flow canvas in their browser.
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
      if (!existing.includes(AGENT_RULE_MARKER)) {
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
When working in any project that uses \`what-is-it\`:
1. Check project status: \`npx what-is-it status\`
2. When completing tasks: \`npx what-is-it task done <id>\`
3. When adding tasks: \`npx what-is-it task add --title "..." --why "..." --where "..."\`
4. View live dashboard: \`npx what-is-it\`
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
    console.error(pc2.red(`Error: ${DEFAULT_FILE_NAME} not found in ${rootDir}. Run 'npx what-is-it init' first.`));
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
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = parsedUrl.pathname;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
          const task = current.tasks.find((t) => t.id === taskId);
          if (!task) throw new Error(`Task ${taskId} not found`);
          task.status = task.status === "done" ? "todo" : "done";
          if (task.status === "done") {
            task.completedAt = (/* @__PURE__ */ new Date()).toISOString();
          } else {
            delete task.completedAt;
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
  const { meta, features, tasks } = data;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const todo = tasks.filter((t) => t.status === "todo");
  const lines = [];
  lines.push(`${pc3.bold(pc3.yellow("UGG."))} PROJECT: ${pc3.cyan(meta.name)} [${pc3.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);
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
  } else if (todo.length > 0) {
    const nextTask = todo[0];
    lines.push("");
    lines.push(pc3.bold("NEXT QUEUED TASK:"));
    lines.push(`* [${pc3.cyan(nextTask.id)}] "${pc3.bold(nextTask.title)}"`);
    lines.push(`  WHY:   ${nextTask.why}`);
    lines.push(`  WHERE: ${pc3.underline(nextTask.where)}`);
    lines.push(`  HOW:   ${nextTask.how}`);
  }
  lines.push("");
  lines.push(`${pc3.dim("AGENT COMMANDS:")}`);
  lines.push(`- Mark done: ${pc3.cyan("npx what-is-it task done <id>")}`);
  lines.push(`- Add task:  ${pc3.cyan('npx what-is-it task add --title "..." --why "..." --where "..."')}`);
  lines.push(`- Open UI:   ${pc3.cyan("npx what-is-it")}`);
  return lines.join("\n");
}
function formatCavemanSuccess(action, id, detail) {
  let msg = `${pc3.bold(pc3.yellow("UGG."))} ${pc3.green(action.toUpperCase())}`;
  if (id) msg += ` [${pc3.cyan(id)}]`;
  if (detail) msg += ` - ${detail}`;
  return msg;
}
function formatCavemanError(err) {
  return `${pc3.bold(pc3.red("GRR."))} ERROR: ${err}. RUN ${pc3.cyan("npx what-is-it status")} TO CHECK.`;
}

// src/cli/index.ts
var program = new Command();
program.name("what-is-it").description("Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding").version("1.0.0");
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
    console.log(`Use ${pc4.cyan("--force")} to overwrite, or run ${pc4.cyan("npx what-is-it")} to open viewer.`);
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
  console.log(`   ${pc4.bold(pc4.cyan("npx what-is-it"))} - Open the live web viewer in your browser
`);
  console.log(pc4.bold(pc4.cyan("\u2550".repeat(68))) + "\n");
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
  saveProjectData(cwd, data);
  console.log(formatCavemanSuccess("TASK COMPLETED", task.id, `"${task.title}"`));
  console.log(`${pc4.dim("Progress now:")} ${pc4.green(`${data.meta.overallProgress}%`)}`);
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
program.command("import <file>").description("Import project data from a JSON file into .what-is-it.bin").action((filePath) => {
  const cwd = process.cwd();
  const fullPath = path3.resolve(cwd, filePath);
  if (!fs3.existsSync(fullPath)) {
    console.error(formatCavemanError(`File ${filePath} not found`));
    process.exit(1);
  }
  try {
    const raw = fs3.readFileSync(fullPath, "utf-8");
    const incoming = JSON.parse(raw);
    saveProjectData(cwd, incoming);
    console.log(formatCavemanSuccess("PROJECT DATA IMPORTED", path3.basename(filePath)));
  } catch (err) {
    console.error(formatCavemanError(`Import failed: ${err.message}`));
    process.exit(1);
  }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map