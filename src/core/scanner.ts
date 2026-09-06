import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type {
  ProjectData,
  ProjectMeta,
  Feature,
  SubFeature,
  Task,
  WikiPage,
  UserFlow,
  ProjectType,
  FlowNode,
  FlowEdge
} from './schema.js';

export interface ScanContext {
  rootDir: string;
  projectName: string;
  projectType: ProjectType;
  frameworks: string[];
  description: string;
  files: string[];
  directories: string[];
  routes: string[];
  components: string[];
  services: string[];
  cliFiles: string[];
  coreFiles: string[];
  testFiles: string[];
  docFiles: string[];
  recentCommits: string[];
  version?: string;
}

function safeReadJson(filePath: string): any {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

function safeExec(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function scanDirectory(dir: string, maxDepth: number = 3, currentDepth: number = 0): { files: string[]; dirs: string[] } {
  const result: { files: string[]; dirs: string[] } = { files: [], dirs: [] };
  if (currentDepth > maxDepth || !fs.existsSync(dir)) return result;

  const ignored = new Set(['node_modules', '.git', 'dist', 'docs', 'build', '.next', '.cache', 'coverage', '.turbo', '.dart_tool', '.what-is-it.bin']);

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        result.dirs.push(fullPath);
        const sub = scanDirectory(fullPath, maxDepth, currentDepth + 1);
        result.files.push(...sub.files);
        result.dirs.push(...sub.dirs);
      } else if (entry.isFile()) {
        result.files.push(fullPath);
      }
    }
  } catch {
    // Permission or I/O error
  }

  return result;
}

export function scanProject(rootDir: string): ScanContext {
  const rootName = path.basename(path.resolve(rootDir));
  const pkgJson = safeReadJson(path.join(rootDir, 'package.json'));
  const pubspecPath = path.join(rootDir, 'pubspec.yaml');
  const cargoPath = path.join(rootDir, 'Cargo.toml');
  const goPath = path.join(rootDir, 'go.mod');
  const pyprojectPath = path.join(rootDir, 'pyproject.toml');

  const frameworks: string[] = [];
  let projectType: ProjectType = 'unknown';
  let projectName = pkgJson?.name || rootName;
  let description = pkgJson?.description || `Project ${projectName}`;

  // Detect monorepo
  const isMonorepo =
    fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(rootDir, 'lerna.json')) ||
    fs.existsSync(path.join(rootDir, 'turbo.json')) ||
    Boolean(pkgJson?.workspaces);

  if (isMonorepo) {
    projectType = 'monorepo';
    frameworks.push('Monorepo');
  }

  // Scan package.json deps
  if (pkgJson) {
    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies
    };

    if (allDeps['react']) frameworks.push('React');
    if (allDeps['next']) {
      frameworks.push('Next.js');
      if (projectType === 'unknown') projectType = 'web';
    }
    if (allDeps['vite']) frameworks.push('Vite');
    if (allDeps['vue']) frameworks.push('Vue');
    if (allDeps['@angular/core']) frameworks.push('Angular');
    if (allDeps['svelte']) frameworks.push('Svelte');
    if (allDeps['react-native']) {
      frameworks.push('React Native');
      projectType = 'mobile';
    }
    if (allDeps['expo']) {
      frameworks.push('Expo');
      projectType = 'mobile';
    }
    if (allDeps['tailwindcss']) frameworks.push('Tailwind CSS');
    if (allDeps['express']) {
      frameworks.push('Express');
      if (projectType === 'unknown') projectType = 'api';
    }
    if (allDeps['fastify']) {
      frameworks.push('Fastify');
      if (projectType === 'unknown') projectType = 'api';
    }
    if (allDeps['@nestjs/core']) {
      frameworks.push('NestJS');
      if (projectType === 'unknown') projectType = 'api';
    }
    if (allDeps['commander'] || pkgJson.bin) {
      frameworks.push('CLI');
      if (projectType === 'unknown') projectType = 'cli';
    }
    if (projectType === 'unknown') {
      projectType = 'web';
    }
  } else if (fs.existsSync(pubspecPath)) {
    projectType = 'mobile';
    frameworks.push('Flutter', 'Dart');
  } else if (fs.existsSync(cargoPath)) {
    frameworks.push('Rust');
    projectType = 'cli';
  } else if (fs.existsSync(goPath)) {
    frameworks.push('Go');
    projectType = 'api';
  } else if (fs.existsSync(pyprojectPath) || fs.existsSync(path.join(rootDir, 'requirements.txt'))) {
    frameworks.push('Python');
  }

  // Deep directory and files scan
  const { files, dirs } = scanDirectory(rootDir, 4);

  const relativeFiles = files.map(f => path.relative(rootDir, f));
  const relativeDirs = dirs.map(d => path.relative(rootDir, d));

  const routes: string[] = [];
  const components: string[] = [];
  const services: string[] = [];
  const cliFiles: string[] = [];
  const coreFiles: string[] = [];
  const testFiles: string[] = [];
  const docFiles: string[] = [];

  for (const f of relativeFiles) {
    const lower = f.toLowerCase();
    if (
      lower.includes('.test.') ||
      lower.includes('.spec.') ||
      lower.startsWith('test/') ||
      lower.startsWith('tests/')
    ) {
      testFiles.push(f);
    } else if (
      lower.includes('routes/') ||
      lower.includes('pages/') ||
      (lower.includes('app/') && (lower.endsWith('page.tsx') || lower.endsWith('page.jsx') || lower.endsWith('page.vue'))) ||
      lower.includes('screens/')
    ) {
      routes.push(f);
    } else if (lower.includes('components/') || lower.includes('widgets/')) {
      components.push(f);
    } else if (lower.includes('api/') || lower.includes('services/') || lower.includes('controllers/')) {
      services.push(f);
    } else if (lower.startsWith('bin/') || lower.includes('cli/')) {
      cliFiles.push(f);
    } else if (lower.includes('core/') || lower.includes('lib/') || lower.includes('models/') || lower.includes('engine/')) {
      coreFiles.push(f);
    } else if (lower.endsWith('.md') || lower.includes('docs/') || lower.includes('.agents/')) {
      docFiles.push(f);
    }
  }

  // Git commits
  const gitLogRaw = safeExec('git log -n 5 --oneline', rootDir);
  const recentCommits = gitLogRaw ? gitLogRaw.split('\n').map(l => l.trim()).filter(Boolean) : [];

  return {
    rootDir,
    projectName,
    projectType,
    frameworks: Array.from(new Set(frameworks)),
    description,
    files: relativeFiles,
    directories: relativeDirs,
    routes,
    components,
    services,
    cliFiles,
    coreFiles,
    testFiles,
    docFiles,
    recentCommits,
    version: pkgJson?.version || '0.1.0'
  };
}

// ---------------------------------------------------------------------------
// Synthesis: build a HONEST, best-effort ProjectData snapshot purely from what
// the static scan above actually found. This deliberately does NOT invent
// feature narratives, UI guidelines, personas, or "missing feature" gaps that
// aren't derivable from the file system — it only reports discovered
// inventory (which files exist, grouped by role) so a project always starts
// from an accurate baseline, whatever its shape. Judgment calls that require
// actually reading code — real feature rationale, UI specs, user flows, and
// flagged missing/bug/security work — belong to the deep `/wii-init`
// agent pass, which reads this baseline and replaces/extends it via `import`.
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'item';
}

function titleFromPath(filePath: string): string {
  const base = path.basename(filePath).replace(/\.(tsx?|jsx?|vue|svelte|dart|py|go|rs)$/i, '');
  const words = base
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return (words.charAt(0).toUpperCase() + words.slice(1)) || base;
}

const MAX_SUBFEATURES_PER_CATEGORY = 10;

interface CategorySpec {
  id: string;
  title: string;
  category: string;
  files: string[];
  order: number;
}

function buildDiscoveredFeature(spec: CategorySpec): Feature {
  const shown = spec.files.slice(0, MAX_SUBFEATURES_PER_CATEGORY);
  const overflow = spec.files.length - shown.length;

  const subFeatures: SubFeature[] = shown.map((f, idx) => ({
    id: `sub-${spec.id}-${idx}-${slugify(path.basename(f))}`,
    title: titleFromPath(f),
    description: 'Discovered during automated codebase scan.',
    status: 'implemented',
    what: `File present in the codebase: \`${f}\`.`,
    why: 'Existence and role inferred from file location; rationale not yet verified by an agent.',
    how: 'Detected by static path-pattern scan (no source code was read).',
    where: f,
    when: 'Discovered at last `init` scan'
  }));

  if (overflow > 0) {
    subFeatures.push({
      id: `sub-${spec.id}-overflow`,
      title: `+${overflow} additional file(s) not shown`,
      status: 'implemented',
      what: `${overflow} more files matched this category but were omitted to keep the state file compact.`,
      why: 'Keeps the compressed binary state small; full list available via a fresh scan or `/wii-init`.',
      how: 'Category listing capped during synthesis.',
      where: spec.files.slice(MAX_SUBFEATURES_PER_CATEGORY).join(', ') || 'N/A',
      when: 'Discovered at last `init` scan'
    });
  }

  return {
    id: spec.id,
    title: spec.title,
    description: `${spec.files.length} file(s) discovered under this category by the automated scanner.`,
    category: spec.category,
    status: 'in_progress',
    progress: 0,
    order: spec.order,
    subFeatures
  };
}

function buildFoundationFeature(context: ScanContext, order: number): Feature {
  const { projectName, projectType, frameworks, directories, files } = context;
  return {
    id: 'feat-foundation',
    title: 'Project Foundation & Structure',
    description: 'Baseline facts established by the automated scan: stack, layout, and scale.',
    category: 'Foundation',
    status: 'in_progress',
    progress: 0,
    order,
    subFeatures: [
      {
        id: 'sub-foundation-stack',
        title: 'Detected Technology Stack',
        status: 'implemented',
        what: `${projectName} is classified as a \`${projectType}\` project using: ${frameworks.join(', ') || 'no recognized framework manifest'}.`,
        why: 'Framework/manifest detection drives how the rest of this tool interprets the codebase.',
        how: 'Parsed package.json / pubspec.yaml / Cargo.toml / go.mod / pyproject.toml dependency manifests.',
        where: 'package.json (or equivalent manifest)',
        when: 'Discovered at last `init` scan'
      },
      {
        id: 'sub-foundation-layout',
        title: 'Directory & File Inventory',
        status: 'implemented',
        what: `${files.length} tracked file(s) across ${directories.length} director(y/ies) (excluding node_modules, build output, and VCS folders).`,
        why: 'Establishes scale before deeper feature/flow analysis.',
        how: 'Recursive filesystem walk up to 4 levels deep with common build/dependency folders ignored.',
        where: directories.slice(0, 5).join(', ') || context.rootDir,
        when: 'Discovered at last `init` scan'
      }
    ]
  };
}

function buildTestingFeature(context: ScanContext, order: number): Feature {
  const { testFiles } = context;
  const hasTests = testFiles.length > 0;
  return {
    id: 'feat-testing',
    title: 'Testing & Quality Assurance',
    description: 'What the scan could determine about automated test coverage.',
    category: 'Verification & QA',
    status: 'in_progress',
    progress: 0,
    order,
    subFeatures: [
      {
        id: 'sub-testing-coverage',
        title: hasTests ? 'Automated Test Files Present' : 'No Automated Test Files Detected',
        status: hasTests ? 'implemented' : 'missing',
        what: hasTests
          ? `${testFiles.length} test/spec file(s) detected.`
          : 'No files matching *.test.*, *.spec.*, or a test(s)/ directory were found.',
        why: 'Automated tests are the primary signal of regression protection.',
        how: 'Path-pattern scan for test/spec naming conventions.',
        where: hasTests ? testFiles.slice(0, 5).join(', ') : 'N/A',
        when: 'Discovered at last `init` scan'
      }
    ]
  };
}

function buildDocsFeature(context: ScanContext, order: number): Feature {
  const { docFiles } = context;
  const hasDocs = docFiles.length > 0;
  return {
    id: 'feat-docs',
    title: 'Documentation Coverage',
    description: 'What the scan could determine about existing project documentation.',
    category: 'Documentation',
    status: 'in_progress',
    progress: 0,
    order,
    subFeatures: [
      {
        id: 'sub-docs-coverage',
        title: hasDocs ? 'Documentation Files Present' : 'No Documentation Files Detected',
        status: hasDocs ? 'implemented' : 'missing',
        what: hasDocs
          ? `${docFiles.length} markdown/doc file(s) detected.`
          : 'No markdown files or docs/ directory were found.',
        why: 'Documentation coverage affects how quickly new contributors (human or AI) can onboard.',
        how: 'Path-pattern scan for *.md files and docs/ directories.',
        where: hasDocs ? docFiles.slice(0, 5).join(', ') : 'N/A',
        when: 'Discovered at last `init` scan'
      }
    ]
  };
}

export function synthesizeProjectData(context: ScanContext): ProjectData {
  const {
    projectName,
    projectType,
    frameworks,
    description,
    routes,
    components,
    services,
    cliFiles,
    coreFiles,
    testFiles,
    docFiles,
    files,
    directories,
    recentCommits,
    version
  } = context;

  const stackStr = frameworks.join(', ') || 'Custom Stack';
  const archSummary = `${projectName} is a ${projectType} project built with ${stackStr}. It contains ${files.length} tracked files across ${routes.length} routes, ${components.length} components, ${services.length} services/APIs, and ${cliFiles.length + coreFiles.length} core/CLI modules.`;

  const meta: ProjectMeta = {
    name: projectName,
    description: description || `Live architectural documentation and progress for ${projectName}`,
    projectType,
    frameworks,
    architectureSummary: archSummary,
    version: version || '0.1.0',
    updatedAt: new Date().toISOString(),
    overallProgress: 0
  };

  // Guaranteed baseline features (always present, always honest about what was/wasn't found).
  const features: Feature[] = [];
  let order = 1;
  features.push(buildFoundationFeature(context, order++));

  const dynamicCategories: CategorySpec[] = [
    { id: 'feat-routes', title: 'Routes & Screens', category: 'Routing & Navigation', files: routes, order: 0 },
    { id: 'feat-components', title: 'UI Components', category: 'Frontend & UI', files: components, order: 0 },
    { id: 'feat-services', title: 'Services & APIs', category: 'Backend & Services', files: services, order: 0 },
    { id: 'feat-cli', title: 'CLI & Automation', category: 'Tooling & CLI', files: cliFiles, order: 0 },
    { id: 'feat-core', title: 'Core Domain Logic', category: 'Core Engine', files: coreFiles, order: 0 }
  ];

  for (const spec of dynamicCategories) {
    if (spec.files.length === 0) continue;
    spec.order = order++;
    features.push(buildDiscoveredFeature(spec));
  }

  features.push(buildTestingFeature(context, order++));
  features.push(buildDocsFeature(context, order++));

  // Calculate overall progress across all sub-features
  let allSubFeaturesCount = 0;
  let allImplementedCount = 0;
  for (const f of features) {
    allSubFeaturesCount += f.subFeatures.length;
    allImplementedCount += f.subFeatures.filter(s => s.status === 'implemented').length;
  }
  meta.overallProgress = allSubFeaturesCount > 0 ? Math.round((allImplementedCount / allSubFeaturesCount) * 100) : 0;

  // Synthesize legacy Tasks 1:1 from subFeatures for backward compatibility. Each task is
  // linked back via subFeatureId so completing it (CLI `task done` or the dashboard
  // checkbox) actually flips the sub-feature that drives real progress — see
  // computeProgress in core/storage.ts.
  const tasks: Task[] = [];
  let taskIndex = 1;
  for (const f of features) {
    for (const sf of f.subFeatures) {
      tasks.push({
        id: `task-${taskIndex++}`,
        featureId: f.id,
        subFeatureId: sf.id,
        title: sf.title,
        status: sf.status === 'implemented' ? 'done' : sf.status === 'in_progress' ? 'in_progress' : 'todo',
        priority: sf.status === 'missing' ? 'high' : 'medium',
        actorRole: 'Developer',
        why: sf.why,
        how: sf.how,
        where: sf.where,
        when: sf.when,
        createdAt: new Date().toISOString(),
        completedAt: sf.status === 'implemented' ? new Date().toISOString() : undefined
      });
    }
  }

  // Wiki: two honest pages built only from real scan data. No fabricated design tokens,
  // personas, or user journeys — those require actually reading the code and belong to the
  // `/wii-init` agent pass.
  const wiki: WikiPage[] = [
    {
      id: 'architecture-overview',
      title: 'Architecture & System Overview',
      category: 'Architecture',
      order: 1,
      lastModified: new Date().toISOString(),
      bookmarks: [
        { id: 'high-level-topology', title: 'High-Level Topology', level: 2 },
        { id: 'tech-stack-decisions', title: 'Tech Stack Decisions', level: 2 },
        { id: 'directory-structure', title: 'Directory Structure', level: 2 },
        { id: 'recent-activity', title: 'Recent Activity', level: 2 }
      ],
      content: `## High-Level Topology\n\n${archSummary}\n\n\`\`\`text\n+-------------------------------------------------------------+\n|                      Client / UI Layer                      |\n|   Routes: ${routes.length} discovered | Components: ${components.length} discovered  |\n+------------------------------+------------------------------+\n                               |\n                               v\n+-------------------------------------------------------------+\n|                   Services & Data Layer                     |\n|   API Endpoints / Services: ${services.length} discovered             |\n+-------------------------------------------------------------+\n                               |\n                               v\n+-------------------------------------------------------------+\n|                   Core Engine & CLI Layer                   |\n|   Core / CLI Modules: ${cliFiles.length + coreFiles.length} discovered               |\n+-------------------------------------------------------------+\n\`\`\`\n\n> This topology reflects file-path pattern matching only — no source code was read. Run \`/wii-init\` in your AI agent chat to replace this with a verified architecture, real user flows, and UI specs.\n\n## Tech Stack Decisions\n\n- **Project Category**: \`${projectType.toUpperCase()}\`\n- **Primary Frameworks**: ${frameworks.map(f => `\`${f}\``).join(', ') || 'Vanilla / Custom'}\n- **Live Documentation**: \`@shakthizen/what-is-it\` compressed binary state & multi-agent skill.\n\n## Directory Structure\n\n\`\`\`text\n${directories.slice(0, 16).map(d => `📁 ${d}`).join('\n') || '📁 root'}\n\`\`\`\n\n## Recent Activity\n\n${recentCommits.length > 0 ? recentCommits.map(c => `- \`${c}\``).join('\n') : '_No git history available._'}\n`
    },
    {
      id: 'codebase-inventory',
      title: 'Codebase Inventory (Auto-Discovered)',
      category: 'Discovery',
      order: 2,
      lastModified: new Date().toISOString(),
      bookmarks: [
        { id: 'discovered-categories', title: 'Discovered Categories', level: 2 },
        { id: 'next-step', title: 'Next Step: Deep Agent Analysis', level: 2 }
      ],
      content: `## Discovered Categories\n\n| Category | Files Found |\n| :--- | ---: |\n| Routes & Screens | ${routes.length} |\n| UI Components | ${components.length} |\n| Services & APIs | ${services.length} |\n| CLI & Automation | ${cliFiles.length} |\n| Core Domain Logic | ${coreFiles.length} |\n| Tests | ${testFiles.length} |\n| Docs | ${docFiles.length} |\n\nThis inventory is a **static, best-effort baseline** produced by \`npx what-is-it init\` — it only reflects file-path patterns, not verified feature rationale, UI design, or real user flows.\n\n## Next Step: Deep Agent Analysis\n\nRun \`/wii-init\` in your AI agent chat (Claude Code, Cursor, Antigravity) so it can:\n1. Actually read the code behind this inventory and correct/extend feature rationale (why/how).\n2. Define real actor roles and user flows, with per-screen mockups (\`mockupSvg\`) instead of generic placeholders.\n3. Flag genuinely missing features, bugs, and security gaps it finds — kept separate from this baseline inventory so the two are never conflated.\n`
    }
  ];

  // Flow: one generic actor connected to whatever real screens/entry-points were
  // discovered (routes > components > services > cli > core), in that priority order.
  // No fabricated personas, colors, or layout guidance — the frame node components already
  // fall back to a neutral generic wireframe when uiGuidelines/visualLayout/mockupSvg are
  // absent, and the deep agent pass is what should fill those in with real specs.
  const isMobileProject = projectType === 'mobile';
  const defaultFrameType = isMobileProject ? 'mobileFrame' : 'desktopFrame';
  const actorLabel = projectType === 'cli' || projectType === 'library'
    ? 'Developer / CLI User'
    : projectType === 'api'
      ? 'API Consumer'
      : 'End User';

  const screenSourcePool = routes.length > 0
    ? routes
    : components.length > 0
      ? components
      : services.length > 0
        ? services
        : cliFiles.length > 0
          ? cliFiles
          : coreFiles;

  const screenFiles = screenSourcePool.slice(0, 6);
  if (screenFiles.length === 0) {
    screenFiles.push('(no source files discovered)');
  }
  if (screenFiles.length === 1) {
    screenFiles.push('(additional functionality — needs agent review)');
  }

  const nodes: FlowNode[] = [
    {
      id: 'actor-primary',
      type: 'actorNode',
      position: { x: 40, y: 200 },
      data: {
        title: actorLabel,
        subtitle: 'Auto-detected — refine via /wii-init',
        actorRole: actorLabel
      }
    },
    ...screenFiles.map((f, idx) => ({
      id: `screen-${idx}`,
      type: defaultFrameType as FlowNode['type'],
      position: { x: 400 + idx * 380, y: 60 + (idx % 2) * 220 },
      data: {
        title: titleFromPath(f) || f,
        subtitle: f,
        actorRole: actorLabel,
        frameType: (isMobileProject ? 'mobile' : 'desktop') as 'mobile' | 'desktop'
      }
    }))
  ];

  const edges: FlowEdge[] = [
    ...screenFiles.map((_, idx) => ({
      id: `e-actor-screen-${idx}`,
      source: 'actor-primary',
      target: `screen-${idx}`,
      label: idx === 0 ? 'Enters' : undefined,
      animated: idx === 0
    })),
    ...screenFiles.slice(1).map((_, idx) => ({
      id: `e-screen-${idx}-${idx + 1}`,
      source: `screen-${idx}`,
      target: `screen-${idx + 1}`,
      label: 'Navigates to'
    }))
  ];

  const flows: UserFlow[] = [
    {
      id: 'discovered-flow',
      title: 'Discovered Entry Points (Auto-Generated Baseline)',
      actorRole: actorLabel,
      description: 'Best-effort flow built from discovered files. Run /wii-init for real user journeys and per-screen mockups.',
      nodes,
      edges
    }
  ];

  return {
    schemaVersion: 1,
    meta,
    features,
    tasks,
    wiki,
    flows
  };
}
