import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
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
import { installSkills } from './skills.js';
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
  .version('1.0.0');

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
      runInit(cwd, false);
    }
    const port = parseInt(options.port, 10) || 3456;
    startServer(cwd, port, options.open !== false);
  });

// Init command
program
  .command('init')
  .description('Map the existing codebase, create .what-is-it.bin, and install agent skills')
  .option('-f, --force', 'Overwrite existing state if already initialized')
  .action((options) => {
    runInit(process.cwd(), options.force);
  });

function runInit(cwd: string, force: boolean) {
  if (projectExists(cwd) && !force) {
    console.log(pc.yellow(`⚠️ ${DEFAULT_FILE_NAME} already exists in ${cwd}.`));
    console.log(`Use ${pc.cyan('--force')} to overwrite, or run ${pc.cyan('npx what-is-it')} to open viewer.`);
    return;
  }

  console.log(pc.bold(pc.cyan('🔍 Mapping project codebase & architecture...')));
  const scanContext = scanProject(cwd);

  console.log(`- Project Name: ${pc.bold(scanContext.projectName)}`);
  console.log(`- Project Type: ${pc.bold(scanContext.projectType)}`);
  console.log(`- Frameworks:   ${scanContext.frameworks.join(', ') || 'Custom'}`);
  console.log(`- Discovered:   ${scanContext.files.length} files, ${scanContext.routes.length} routes, ${scanContext.components.length} components`);

  const projectData = synthesizeProjectData(scanContext);
  const { binPath, mdPath } = saveProjectData(cwd, projectData);

  console.log(pc.green(`\n✔ Saved compressed binary: ${binPath} (${fs.statSync(binPath).size} bytes)`));
  if (mdPath) {
    console.log(pc.green(`✔ Generated markdown overview: ${mdPath}`));
  }

  // Install agent skills
  const { skillPath, rulesUpdated } = installSkills(cwd);
  console.log(pc.green(`✔ Installed agent skill: ${skillPath}`));
  if (rulesUpdated.length > 0) {
    console.log(pc.green(`✔ Updated agent guidelines: ${rulesUpdated.join(', ')}`));
  }

  console.log('\n' + formatCavemanSuccess('PROJECT INITIALIZED & MAPPED', scanContext.projectName));
  console.log(`${pc.dim('Run')} ${pc.cyan('npx what-is-it')} ${pc.dim('to launch interactive browser dashboard.')}\n`);
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
    const taskId = `task-${Date.now().toString().slice(-4)}`;

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
    saveProjectData(cwd, data);

    console.log(formatCavemanSuccess('TASK COMPLETED', task.id, `"${task.title}"`));
    console.log(`${pc.dim('Progress now:')} ${pc.green(`${data.meta.overallProgress}%`)}`);
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
  .description('Import project data from a JSON file into .what-is-it.bin')
  .action((filePath: string) => {
    const cwd = process.cwd();
    const fullPath = path.resolve(cwd, filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(formatCavemanError(`File ${filePath} not found`));
      process.exit(1);
    }

    try {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const incoming = JSON.parse(raw) as any;
      saveProjectData(cwd, incoming);
      console.log(formatCavemanSuccess('PROJECT DATA IMPORTED', path.basename(filePath)));
    } catch (err) {
      console.error(formatCavemanError(`Import failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
