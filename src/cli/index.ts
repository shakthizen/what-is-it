import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import pc from 'picocolors';
import {
  loadProjectData,
  saveProjectData,
  projectExists,
  DEFAULT_FILE_NAME,
  DEFAULT_MARKDOWN_NAME
} from '../core/storage.js';
import { scanProject, synthesizeProjectData } from '../core/scanner.js';
import { generateMarkdownOverview } from '../core/markdown.js';
import { getProjectJsonSchema, validateProjectData } from '../core/schema.js';
import {
  installSkills,
  parseAgentTargets,
  DEFAULT_AGENT_TARGETS,
  AGENT_TARGETS,
  type AgentTarget
} from './skills.js';
import { startServer } from './server.js';
import {
  formatCavemanStatus,
  formatCavemanSuccess,
  formatCavemanError
} from './caveman.js';
import type { Task, Feature, Priority } from '../core/schema.js';

const program = new Command();

program
  .name('what-is-it')
  .description('Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding')
  .version('1.1.1');

function askQuestion(query: string): Promise<string> {
  if (!process.stdin.isTTY) return Promise.resolve('');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Resolves which agent ecosystems to install support for: an explicit --agents
// flag wins outright; otherwise prompt interactively (TTY) so the user picks
// only what they actually use instead of every proprietary format landing in
// their repo unasked; a non-interactive run with nothing specified falls back
// to just the vendor-neutral AGENTS.md.
async function resolveAgentTargets(rawFlag: string | undefined): Promise<AgentTarget[]> {
  const fromFlag = parseAgentTargets(rawFlag);
  if (fromFlag) return fromFlag;

  if (!process.stdin.isTTY) return DEFAULT_AGENT_TARGETS;

  console.log(`\n${pc.cyan('?')} Which AI agent(s)/IDE(s) do you use? (comma-separated numbers, or "all")`);
  AGENT_TARGETS.forEach((t, i) => {
    console.log(`   ${pc.bold(String(i + 1))}. ${t.label} ${pc.dim(`— ${t.installs}`)}`);
  });
  const answer = await askQuestion(`   ${pc.dim(`[default: ${DEFAULT_AGENT_TARGETS.join(', ')}]`)} > `);

  if (!answer) return DEFAULT_AGENT_TARGETS;
  if (answer.trim().toLowerCase() === 'all') return AGENT_TARGETS.map(t => t.id);

  const chosen = answer
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= AGENT_TARGETS.length)
    .map(n => AGENT_TARGETS[n - 1].id);

  return chosen.length > 0 ? Array.from(new Set(chosen)) : DEFAULT_AGENT_TARGETS;
}

// Default action: if no command passed, launch UI
program
  .command('ui', { isDefault: true })
  .description('Launch the live interactive web viewer')
  .option('-p, --port <number>', 'Port to listen on', '3456')
  .option('--no-open', 'Do not open browser automatically')
  .action((options) => {
    const cwd = process.cwd();
    if (!projectExists(cwd)) {
      console.log(pc.yellow(`No ${DEFAULT_FILE_NAME} found in current directory.`));
      console.log(`Running auto-mapping initialization first...\n`);
      runInit(cwd, { force: false, open: options.open });
      return;
    }
    const port = parseInt(options.port, 10) || 3456;
    startServer(cwd, port, options.open !== false);
  });

// Init command
program
  .command('init')
  .description('Map the existing codebase, create .what-is-it.bin, and install agent skills')
  .option('-f, --force', 'Overwrite existing state if already initialized')
  .option('--agents <list>', `Comma-separated agent targets to install (${AGENT_TARGETS.map(t => t.id).join(', ')}, or "all"); prompts interactively if omitted`)
  .action((options) => {
    runInit(process.cwd(), options);
  });

async function runInit(cwd: string, options: { force?: boolean; open?: boolean; agents?: string } = {}) {
  if (projectExists(cwd) && !options.force) {
    console.log(pc.yellow(`⚠️ ${DEFAULT_FILE_NAME} already exists in ${cwd}.`));
    console.log(`Use ${pc.cyan('--force')} to overwrite, or run ${pc.cyan('npx what-is-it')} to open viewer.`);
    return;
  }

  console.log(pc.bold(pc.cyan('\n🔍 Mapping project codebase & architecture...')));
  const scanContext = scanProject(cwd);

  console.log(`- Project Name: ${pc.bold(scanContext.projectName)}`);
  console.log(`- Project Type: ${pc.bold(scanContext.projectType)}`);
  console.log(`- Frameworks:   ${scanContext.frameworks.join(', ') || 'Custom'}`);
  console.log(`- Discovered:   ${scanContext.files.length} files, ${scanContext.routes.length} routes, ${scanContext.components.length} components`);

  const projectData = synthesizeProjectData(scanContext);
  const { binPath, mdPath } = saveProjectData(cwd, projectData);

  console.log(pc.green(`✔ Saved compressed binary: ${binPath} (${fs.statSync(binPath).size} bytes)`));
  if (mdPath) {
    console.log(pc.green(`✔ Generated markdown overview: ${mdPath}`));
  }

  // Install agent skills & slash commands only for the ecosystem(s) the user actually uses
  const agents = await resolveAgentTargets(options.agents);
  const { skillPath, rulesUpdated, slashCommands } = installSkills({
    rootDir: cwd,
    meta: projectData.meta,
    agents
  });
  if (skillPath) {
    console.log(pc.green(`✔ Installed project-specific skill: ${skillPath}`));
  }
  if (slashCommands.length > 0) {
    console.log(pc.green(`✔ Installed native slash commands: ${slashCommands.join(', ')}`));
  }
  if (rulesUpdated.length > 0) {
    console.log(pc.green(`✔ Updated multi-agent rules: ${rulesUpdated.join(', ')}`));
  }

  // Prominent onboarding call-to-action banner. Only advertise slash commands
  // that were actually installed (e.g. an agents-md-only install has none).
  console.log('\n' + pc.bold(pc.cyan('═'.repeat(68))));
  console.log(pc.bold(pc.green('  🎉 what-is-it project memory initialized successfully!')));
  console.log(pc.bold(pc.cyan('═'.repeat(68))));
  console.log(`\n${pc.bold(pc.yellow('👉 NEXT STEP (DELEGATE TO YOUR AI AGENT):'))}`);
  if (slashCommands.includes('/wii-init')) {
    console.log(`   Open your AI Agent chat and type:`);
    console.log(`   ${pc.bold(pc.magenta('/wii-init'))}`);
    console.log(`   ${pc.dim('-> Your agent will analyze the codebase and formulate deep domain tasks & user flows.')}\n`);
    if (slashCommands.includes('/wii-status')) {
      console.log(`   ${pc.bold(pc.cyan('/wii-status'))}     - Check active tasks and progress anytime`);
    }
    if (slashCommands.includes('/wii-task-done')) {
      console.log(`   ${pc.bold(pc.cyan('/wii-task-done'))}  - Mark tasks done as you code`);
    }
  } else {
    console.log(`   Tell your AI agent to read the project instructions installed above (${rulesUpdated.join(', ') || 'your rule file'})`);
    console.log(`   and do a deep pass: read the real code, replace the baseline with verified features and`);
    console.log(`   user flows, then run ${pc.cyan('npx what-is-it import <file.json>')} with the result.\n`);
  }
  console.log(`   ${pc.bold(pc.cyan('npx what-is-it'))} - Open the live web viewer in your browser\n`);
  console.log(pc.bold(pc.cyan('═'.repeat(68))) + '\n');
}

// Status command (Agent-friendly caveman output)
program
  .command('status')
  .description('Print concise caveman-style project status and active tasks for agents')
  .action(() => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found. Run 'npx what-is-it init' first.`));
      process.exit(1);
    }
    console.log(formatCavemanStatus(data));
  });

// Schema command for AI Agents
program
  .command('schema')
  .description('Print the complete JSON schema for what-is-it project state (ideal for AI agents)')
  .action(() => {
    console.log(JSON.stringify(getProjectJsonSchema(), null, 2));
  });

// Standalone skill installer (project-scoped only — no global/user-wide install)
program
  .command('install-skill')
  .description('Install this project\'s agent skill, rules, and slash commands')
  .option('--agents <list>', `Comma-separated agent targets to install (${AGENT_TARGETS.map(t => t.id).join(', ')}, or "all"); prompts interactively if omitted`)
  .action(async (options) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    const agents = await resolveAgentTargets(options.agents);
    const { skillPath, rulesUpdated, slashCommands } = installSkills({
      rootDir: cwd,
      meta: data?.meta,
      agents
    });
    if (skillPath) {
      console.log(pc.green(`✔ Installed project-specific skill: ${skillPath}`));
    }
    if (slashCommands.length > 0) {
      console.log(pc.green(`✔ Installed slash commands: ${slashCommands.join(', ')}`));
    }
    if (rulesUpdated.length > 0) {
      console.log(pc.green(`✔ Updated rules: ${rulesUpdated.join(', ')}`));
    }
  });

// Task commands
const taskCmd = program.command('task').description('Manage project tasks');

taskCmd
  .command('add')
  .description('Add a new task to the project')
  .requiredOption('--title <string>', 'Task title')
  .option('--feature <string>', 'Feature ID (defaults to first feature)')
  .option('--why <string>', 'Rationale / problem solved', 'Improve codebase and user experience')
  .option('--how <string>', 'Technical approach / implementation details', 'Implement required code and tests')
  .option('--where <string>', 'Files or routes touched', 'src/')
  .option('--when <string>', 'Milestone / phase', 'Current Sprint')
  .option('--priority <priority>', 'Priority (low, medium, high, urgent)', 'medium')
  .option('--role <role>', 'Actor role', 'Developer')
  .action((options) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
      process.exit(1);
    }

    const featureId = options.feature || (data.features[0]?.id || 'core');
    const taskId = `task-${data.tasks.length + 1}-${Math.random().toString(36).slice(2, 6)}`;

    const newTask: Task = {
      id: taskId,
      featureId,
      title: options.title,
      status: 'todo',
      priority: (options.priority as Priority) || 'medium',
      actorRole: options.role || 'Developer',
      why: options.why,
      how: options.how,
      where: options.where,
      when: options.when,
      createdAt: new Date().toISOString()
    };

    data.tasks.push(newTask);
    saveProjectData(cwd, data);
    console.log(formatCavemanSuccess('TASK ADDED', taskId, `"${newTask.title}" in ${featureId}`));
  });

taskCmd
  .command('done <taskId>')
  .description('Mark a task as completed')
  .action((taskId: string) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
      process.exit(1);
    }

    const task = data.tasks.find(t => t.id === taskId || t.id.toLowerCase() === taskId.toLowerCase());
    if (!task) {
      console.error(formatCavemanError(`Task ${taskId} not found`));
      process.exit(1);
    }

    task.status = 'done';
    task.completedAt = new Date().toISOString();

    // Tasks are a legacy mirror of SubFeatures; progress is computed from SubFeature.status
    // (see computeProgress in core/storage.ts), so the linked sub-feature must flip too or
    // this command will report success while overall progress never moves.
    if (task.subFeatureId) {
      const feature = data.features.find(f => f.id === task.featureId);
      const sub = feature?.subFeatures?.find(sf => sf.id === task.subFeatureId);
      if (sub) sub.status = 'implemented';
    }

    saveProjectData(cwd, data);
    const updated = loadProjectData(cwd) ?? data;

    console.log(formatCavemanSuccess('TASK COMPLETED', task.id, `"${task.title}"`));
    console.log(`${pc.dim('Progress now:')} ${pc.green(`${updated.meta.overallProgress}%`)}`);
  });

taskCmd
  .command('list')
  .description('List all tasks')
  .option('--status <status>', 'Filter by status (todo, in_progress, done)')
  .action((options) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
      process.exit(1);
    }

    let filtered = data.tasks;
    if (options.status) {
      filtered = filtered.filter(t => t.status === options.status);
    }

    console.log(pc.bold(`\nTASKS (${filtered.length} total):`));
    for (const t of filtered) {
      const icon = t.status === 'done' ? pc.green('✔') : t.status === 'in_progress' ? pc.yellow('⚡') : pc.dim('○');
      console.log(`${icon} [${pc.cyan(t.id)}] ${pc.bold(t.title)} (${t.status})`);
      console.log(`    WHERE: ${pc.underline(t.where)} | WHY: ${t.why}`);
    }
    console.log('');
  });

// Feature commands
const featCmd = program.command('feature').description('Manage project features');

featCmd
  .command('add')
  .description('Add a new feature group')
  .requiredOption('--id <string>', 'Unique feature ID')
  .requiredOption('--title <string>', 'Feature title')
  .option('--desc <string>', 'Feature description', '')
  .option('--category <string>', 'Feature category', 'General')
  .action((options) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
      process.exit(1);
    }

    if (data.features.some(f => f.id === options.id)) {
      console.error(formatCavemanError(`Feature ID "${options.id}" already exists`));
      process.exit(1);
    }

    const newFeature: Feature = {
      id: options.id,
      title: options.title,
      description: options.desc,
      category: options.category,
      status: 'planned',
      progress: 0,
      order: data.features.length + 1
    };

    data.features.push(newFeature);
    saveProjectData(cwd, data);
    console.log(formatCavemanSuccess('FEATURE ADDED', options.id, `"${options.title}"`));
  });

// Export & Import
program
  .command('export')
  .description('Export project data to JSON or Markdown')
  .option('--format <format>', 'Export format (json or md)', 'json')
  .action((options) => {
    const cwd = process.cwd();
    const data = loadProjectData(cwd);
    if (!data) {
      console.error(formatCavemanError(`No ${DEFAULT_FILE_NAME} found`));
      process.exit(1);
    }

    if (options.format === 'md') {
      console.log(generateMarkdownOverview(data));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  });

program
  .command('import <file>')
  .description('Import project data from a JSON file into .what-is-it.bin and clean up scratch files')
  .option('--no-clean', 'Do not remove scratch state file after import')
  .action((filePath: string, options: { clean?: boolean }) => {
    const cwd = process.cwd();
    const fullPath = path.resolve(cwd, filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(formatCavemanError(`File ${filePath} not found`));
      process.exit(1);
    }

    try {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const incoming = JSON.parse(raw) as any;
      if (!validateProjectData(incoming)) {
        console.error(formatCavemanError('Import file does not match the expected project data shape. Run `npx what-is-it schema` to inspect the required structure.'));
        process.exit(1);
      }
      saveProjectData(cwd, incoming);
      console.log(formatCavemanSuccess('PROJECT DATA IMPORTED', path.basename(filePath)));

      // Auto-remove scratch state file if located in scratch or has scratch in name
      const isScratch = filePath.includes('scratch') || fullPath.includes('/scratch/');
      if (isScratch && options.clean !== false) {
        try {
          fs.unlinkSync(fullPath);
          console.log(pc.dim(`✔ Cleaned up scratch state file: ${filePath}`));

          const parentDir = path.dirname(fullPath);
          if (path.basename(parentDir) === 'scratch') {
            const remaining = fs.readdirSync(parentDir);
            if (remaining.length === 0) {
              fs.rmdirSync(parentDir);
              console.log(pc.dim(`✔ Pruned empty scratch directory`));
            }
          }
        } catch {
          // Ignore cleanup error
        }
      }
    } catch (err) {
      console.error(formatCavemanError(`Import failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
