import {
  DEFAULT_FILE_NAME,
  generateMarkdownOverview,
  loadProjectData,
  projectExists,
  saveProjectData,
  scanProject,
  synthesizeProjectData
} from "../chunk-6PRI3TT6.js";

// src/cli/index.ts
import { Command } from "commander";
import path3 from "path";
import fs3 from "fs";
import pc3 from "picocolors";

// src/cli/skills.ts
import fs from "fs";
import path from "path";
var SKILL_CONTENT = `---
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
function installSkills(rootDir) {
  const skillDir = path.join(rootDir, ".agents", "skills", "what-is-it");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, "SKILL.md");
  fs.writeFileSync(skillPath, SKILL_CONTENT, "utf-8");
  const rulesUpdated = [];
  const targetRuleFiles = ["AGENTS.md", "GEMINI.md"];
  for (const file of targetRuleFiles) {
    const rulePath = path.join(rootDir, file);
    if (fs.existsSync(rulePath)) {
      const existing = fs.readFileSync(rulePath, "utf-8");
      if (!existing.includes(AGENT_RULE_MARKER)) {
        fs.writeFileSync(rulePath, existing + "\n" + AGENT_RULE_CONTENT, "utf-8");
        rulesUpdated.push(file);
      }
    }
  }
  if (rulesUpdated.length === 0 && !fs.existsSync(path.join(rootDir, "AGENTS.md"))) {
    const agentsPath = path.join(rootDir, "AGENTS.md");
    fs.writeFileSync(agentsPath, AGENT_RULE_CONTENT.trim() + "\n", "utf-8");
    rulesUpdated.push("AGENTS.md");
  }
  return { skillPath, rulesUpdated };
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
    let filePath = path2.join(webDistDir, pathname === "/" ? "index.html" : pathname);
    if (!fs2.existsSync(filePath) || fs2.statSync(filePath).isDirectory()) {
      filePath = path2.join(webDistDir, "index.html");
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
  const { meta, features, tasks } = data;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const todo = tasks.filter((t) => t.status === "todo");
  const lines = [];
  lines.push(`${pc2.bold(pc2.yellow("UGG."))} PROJECT: ${pc2.cyan(meta.name)} [${pc2.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);
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
  } else if (todo.length > 0) {
    const nextTask = todo[0];
    lines.push("");
    lines.push(pc2.bold("NEXT QUEUED TASK:"));
    lines.push(`* [${pc2.cyan(nextTask.id)}] "${pc2.bold(nextTask.title)}"`);
    lines.push(`  WHY:   ${nextTask.why}`);
    lines.push(`  WHERE: ${pc2.underline(nextTask.where)}`);
    lines.push(`  HOW:   ${nextTask.how}`);
  }
  lines.push("");
  lines.push(`${pc2.dim("AGENT COMMANDS:")}`);
  lines.push(`- Mark done: ${pc2.cyan("npx what-is-it task done <id>")}`);
  lines.push(`- Add task:  ${pc2.cyan('npx what-is-it task add --title "..." --why "..." --where "..."')}`);
  lines.push(`- Open UI:   ${pc2.cyan("npx what-is-it")}`);
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
program.name("what-is-it").description("Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding").version("1.0.0");
program.command("ui", { isDefault: true }).description("Launch the live interactive web viewer").option("-p, --port <number>", "Port to listen on", "3456").option("--no-open", "Do not open browser automatically").action((options) => {
  const cwd = process.cwd();
  if (!projectExists(cwd)) {
    console.log(pc3.yellow(`No ${DEFAULT_FILE_NAME} found in current directory.`));
    console.log(`Running auto-mapping initialization first...
`);
    runInit(cwd, false);
  }
  const port = parseInt(options.port, 10) || 3456;
  startServer(cwd, port, options.open !== false);
});
program.command("init").description("Map the existing codebase, create .what-is-it.bin, and install agent skills").option("-f, --force", "Overwrite existing state if already initialized").action((options) => {
  runInit(process.cwd(), options.force);
});
function runInit(cwd, force) {
  if (projectExists(cwd) && !force) {
    console.log(pc3.yellow(`\u26A0\uFE0F ${DEFAULT_FILE_NAME} already exists in ${cwd}.`));
    console.log(`Use ${pc3.cyan("--force")} to overwrite, or run ${pc3.cyan("npx what-is-it")} to open viewer.`);
    return;
  }
  console.log(pc3.bold(pc3.cyan("\u{1F50D} Mapping project codebase & architecture...")));
  const scanContext = scanProject(cwd);
  console.log(`- Project Name: ${pc3.bold(scanContext.projectName)}`);
  console.log(`- Project Type: ${pc3.bold(scanContext.projectType)}`);
  console.log(`- Frameworks:   ${scanContext.frameworks.join(", ") || "Custom"}`);
  console.log(`- Discovered:   ${scanContext.files.length} files, ${scanContext.routes.length} routes, ${scanContext.components.length} components`);
  const projectData = synthesizeProjectData(scanContext);
  const { binPath, mdPath } = saveProjectData(cwd, projectData);
  console.log(pc3.green(`
\u2714 Saved compressed binary: ${binPath} (${fs3.statSync(binPath).size} bytes)`));
  if (mdPath) {
    console.log(pc3.green(`\u2714 Generated markdown overview: ${mdPath}`));
  }
  const { skillPath, rulesUpdated } = installSkills(cwd);
  console.log(pc3.green(`\u2714 Installed agent skill: ${skillPath}`));
  if (rulesUpdated.length > 0) {
    console.log(pc3.green(`\u2714 Updated agent guidelines: ${rulesUpdated.join(", ")}`));
  }
  console.log("\n" + formatCavemanSuccess("PROJECT INITIALIZED & MAPPED", scanContext.projectName));
  console.log(`${pc3.dim("Run")} ${pc3.cyan("npx what-is-it")} ${pc3.dim("to launch interactive browser dashboard.")}
`);
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
var taskCmd = program.command("task").description("Manage project tasks");
taskCmd.command("add").description("Add a new task to the project").requiredOption("--title <string>", "Task title").option("--feature <string>", "Feature ID (defaults to first feature)").option("--why <string>", "Rationale / problem solved", "Improve codebase and user experience").option("--how <string>", "Technical approach / implementation details", "Implement required code and tests").option("--where <string>", "Files or routes touched", "src/").option("--when <string>", "Milestone / phase", "Current Sprint").option("--priority <priority>", "Priority (low, medium, high, urgent)", "medium").option("--role <role>", "Actor role", "Developer").action((options) => {
  const cwd = process.cwd();
  const data = loadProjectData(cwd);
  if (!data) {
    console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
    process.exit(1);
  }
  const featureId = options.feature || (data.features[0]?.id || "core");
  const taskId = `task-${Date.now().toString().slice(-4)}`;
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
  console.log(`${pc3.dim("Progress now:")} ${pc3.green(`${data.meta.overallProgress}%`)}`);
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