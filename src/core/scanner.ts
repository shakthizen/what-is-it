import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type {
  ProjectData,
  ProjectMeta,
  Feature,
  Task,
  WikiPage,
  UserFlow,
  ProjectType,
  FlowNode,
  FlowEdge
} from './schema.js';

interface ScanContext {
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
  recentCommits: string[];
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

  const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.cache', 'coverage', '.turbo', '.dart_tool']);

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

  for (const f of relativeFiles) {
    const lower = f.toLowerCase();
    if (
      lower.includes('routes/') ||
      lower.includes('pages/') ||
      lower.includes('app/') && (lower.endsWith('page.tsx') || lower.endsWith('page.jsx') || lower.endsWith('page.vue')) ||
      lower.includes('screens/')
    ) {
      routes.push(f);
    } else if (lower.includes('components/') || lower.includes('widgets/')) {
      components.push(f);
    } else if (lower.includes('api/') || lower.includes('services/') || lower.includes('controllers/')) {
      services.push(f);
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
    recentCommits
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
    recentCommits,
    files
  } = context;

  const stackStr = frameworks.join(', ') || 'Custom Stack';
  const archSummary = `${projectName} is a ${projectType} project built with ${stackStr}. It contains ${files.length} tracked files across ${routes.length} routes, ${components.length} components, and ${services.length} services/APIs.`;

  const meta: ProjectMeta = {
    name: projectName,
    description: description || `Live architectural documentation and progress for ${projectName}`,
    projectType,
    frameworks,
    architectureSummary: archSummary,
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    overallProgress: 0 // will be computed
  };

  // Generate initial features
  const features: Feature[] = [
    {
      id: 'core-architecture',
      title: 'Core Architecture & Project Setup',
      description: 'Foundational framework, build pipeline, package configurations, and typing.',
      category: 'Foundation',
      status: 'completed',
      progress: 100,
      order: 1
    },
    {
      id: 'ui-screens',
      title: 'UI Screens & User Interface',
      description: 'Visual interfaces, pages, routing, navigation, and reusable design components.',
      category: 'Frontend',
      status: routes.length > 0 ? 'in_progress' : 'planned',
      progress: routes.length > 0 ? 60 : 20,
      order: 2
    },
    {
      id: 'data-services',
      title: 'Data Flow, API & State Management',
      description: 'Service layer, API clients, state stores, and backend endpoints.',
      category: 'Data & Backend',
      status: services.length > 0 ? 'in_progress' : 'planned',
      progress: services.length > 0 ? 50 : 10,
      order: 3
    },
    {
      id: 'testing-quality',
      title: 'Verification, Docs & Quality Assurance',
      description: 'Automated test suites, live wiki documentation, and developer tooling.',
      category: 'Operations',
      status: 'in_progress',
      progress: 75,
      order: 4
    }
  ];

  // Synthesize tasks with Why, How, Where, When
  const tasks: Task[] = [];
  let taskCounter = 1;

  // Foundation tasks
  tasks.push({
    id: `task-${taskCounter++}`,
    featureId: 'core-architecture',
    title: 'Initialize repository structure and configuration',
    status: 'done',
    priority: 'high',
    actorRole: 'Developer',
    why: 'Establish clean directory structure, package manifests, and development dependencies.',
    how: `Configured package manifest with ${stackStr} toolchain and scripts.`,
    where: files.find(f => f.endsWith('package.json') || f.endsWith('Cargo.toml') || f.endsWith('pubspec.yaml')) || 'package.json',
    when: 'Project Kickoff (Milestone 1)',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  });

  // UI / Screen tasks
  if (routes.length > 0) {
    for (let i = 0; i < Math.min(routes.length, 3); i++) {
      const r = routes[i];
      const pageName = path.basename(r).replace(/\.[^/.]+$/, '');
      tasks.push({
        id: `task-${taskCounter++}`,
        featureId: 'ui-screens',
        title: `Implement ${pageName} screen view`,
        status: 'done',
        priority: 'medium',
        actorRole: 'User',
        why: `Provide primary user experience and navigation for ${pageName}.`,
        how: `Built responsive UI view using ${frameworks[0] || 'standard components'}.`,
        where: r,
        when: 'Phase 1 MVP',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });
    }
  }

  // Pending UI task
  tasks.push({
    id: `task-${taskCounter++}`,
    featureId: 'ui-screens',
    title: 'Refine responsive layouts and UI guidelines integration',
    status: 'in_progress',
    priority: 'high',
    actorRole: 'User',
    why: 'Ensure seamless usability across mobile, tablet, and desktop form factors with consistent design tokens.',
    how: 'Apply Tailwind responsive utility variants and audit component spacing, typography, and contrast.',
    where: components[0] || 'src/components',
    when: 'Current Sprint',
    createdAt: new Date().toISOString()
  });

  // Service tasks
  if (services.length > 0) {
    tasks.push({
      id: `task-${taskCounter++}`,
      featureId: 'data-services',
      title: 'Setup services and API data fetching layer',
      status: 'done',
      priority: 'high',
      actorRole: 'System',
      why: 'Provide reliable asynchronous data access and abstraction layer for UI components.',
      how: 'Implemented typed client functions with error handling and response validation.',
      where: services[0],
      when: 'Phase 1 MVP',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
  }

  tasks.push({
    id: `task-${taskCounter++}`,
    featureId: 'data-services',
    title: 'Implement robust error boundaries and loading states',
    status: 'todo',
    priority: 'medium',
    actorRole: 'User',
    why: 'Prevent application crashes during network drops and provide clear feedback to the user.',
    how: 'Wrap async views with fallback skeletons and toast notification interceptors.',
    where: services[0] || 'src/services',
    when: 'Next Milestone',
    createdAt: new Date().toISOString()
  });

  // QA & Docs task
  tasks.push({
    id: `task-${taskCounter++}`,
    featureId: 'testing-quality',
    title: 'Integrate live project memory with what-is-it',
    status: 'done',
    priority: 'high',
    actorRole: 'Developer',
    why: 'Eliminate vibe coding amnesia by establishing a live, self-updating project documentation anchor.',
    how: 'Installed what-is-it binary engine, agent skills, and interactive browser dashboard.',
    where: '.what-is-it.bin, .agents/skills/what-is-it/SKILL.md',
    when: 'Initial Onboarding',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  });

  // Synthesize rich Wiki Pages with bookmarks and visual graphics
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
        { id: 'directory-structure', title: 'Directory Structure', level: 2 }
      ],
      content: `## High-Level Topology\n\n${archSummary}\n\n\`\`\`text\n+-------------------------------------------------------------+\n|                      Client / UI Layer                      |\n|   Routes: ${routes.length} discovered | Components: ${components.length} discovered  |\n+------------------------------+------------------------------+\n                               |\n                               v\n+-------------------------------------------------------------+\n|                   Services & Data Layer                     |\n|   API Endpoints / Services: ${services.length} discovered             |\n+-------------------------------------------------------------+\n\`\`\`\n\n## Tech Stack Decisions\n\n- **Project Category**: \`${projectType.toUpperCase()}\`\n- **Primary Frameworks**: ${frameworks.map(f => `\`${f}\``).join(', ') || 'Vanilla / Custom'}\n- **Live Documentation**: \`what-is-it\` binary compressed state & agent skill.\n\n## Directory Structure\n\n\`\`\`text\n${context.directories.slice(0, 10).map(d => `📁 ${d}`).join('\n') || '📁 root'}\n\`\`\`\n`
    },
    {
      id: 'ui-design-guidelines',
      title: 'UI Guidelines & Design System',
      category: 'Design & UX',
      order: 2,
      lastModified: new Date().toISOString(),
      bookmarks: [
        { id: 'design-principles', title: 'Design Principles', level: 2 },
        { id: 'color-palette-tokens', title: 'Color Palette Tokens', level: 2 },
        { id: 'layout-and-breakpoints', title: 'Layout & Breakpoints', level: 2 }
      ],
      content: `## Design Principles\n\n1. **Visual Clarity First**: Use crisp vector wireframes, distinct typography scales, and generous whitespace.\n2. **Immediate Feedback**: Micro-interactions, animated state transitions, and clear loading states.\n3. **Actor-Role Empathy**: Customize interfaces specifically for the active user role.\n\n## Color Palette Tokens\n\n| Role / Intent | Hex Token | Visual Representation |\n| :--- | :--- | :--- |\n| **Primary Brand** | \`#6366f1\` (Indigo 500) | 🟣 Primary buttons, active tabs |\n| **Success / Done** | \`#10b981\` (Emerald 500) | 🟢 Completed tasks, status indicators |\n| **In Progress** | \`#f59e0b\` (Amber 500) | 🟡 Active execution, pending review |\n| **Dark Background** | \`#090d16\` (Slate 950) | ⬛ Deep obsidian canvas |\n| **Surface Card** | \`#131b2e\` (Slate 900) | 🪟 Frosted glass card containers |\n\n## Layout & Breakpoints\n\n- **Mobile**: \`< 640px\` — single-column flow, bottom action sheet / bottom tab bar.\n- **Tablet**: \`640px - 1024px\` — flexible grid with collapsible sidebar.\n- **Desktop**: \`> 1024px\` — three-pane view (Navigation + Main Workspace + Bookmarks/Inspector).\n`
    },
    {
      id: 'actor-roles-user-journeys',
      title: 'Actor Roles & User Journeys',
      category: 'Product & UX',
      order: 3,
      lastModified: new Date().toISOString(),
      bookmarks: [
        { id: 'identified-actors', title: 'Identified Actors', level: 2 },
        { id: 'primary-user-flow', title: 'Primary User Flow', level: 2 }
      ],
      content: `## Identified Actors\n\n- 👤 **Guest / Visitor**: Unauthenticated user exploring landing pages and feature overviews.\n- 🔑 **Authenticated User**: Signed-in member executing tasks, workflows, and viewing personal dashboards.\n- 🛡️ **Administrator**: System manager managing configuration, user roles, and monitoring metrics.\n\n## Primary User Flow\n\n\`\`\`text\n[Guest] --> (Visits App) --> [Landing Page]\n                                  |\n                                  v (Signs Up / Logs In)\n                           [Authentication Modal]\n                                  |\n                                  v (Authorized)\n[User]  --> [Main Dashboard] <---> [Interactive Detail Views]\n                                  |\n                                  v (Admin Privileges)\n[Admin] --> [Management Console]\n\`\`\`\n`
    }
  ];

  // Synthesize visual React Flow User Flow with SVG Mockup Frames
  const isMobileProject = projectType === 'mobile';
  const defaultFrameType = isMobileProject ? 'mobileFrame' : 'desktopFrame';

  const nodes: FlowNode[] = [
    {
      id: 'actor-guest',
      type: 'actorNode',
      position: { x: 50, y: 150 },
      data: {
        title: 'Guest / Visitor',
        subtitle: 'Unauthenticated User',
        actorRole: 'Guest'
      }
    },
    {
      id: 'screen-landing',
      type: defaultFrameType,
      position: { x: 300, y: 50 },
      data: {
        title: 'Landing / Entry View',
        subtitle: routes[0] || 'src/pages/index',
        actorRole: 'Guest',
        frameType: isMobileProject ? 'mobile' : 'desktop',
        uiGuidelines: {
          layout: isMobileProject ? 'Single-column vertical scroll' : 'Navbar + Hero Section + Feature Grid',
          colors: ['#6366f1', '#090d16', '#ffffff'],
          typography: 'Display Bold 32px, Body Regular 14px',
          responsive: 'Fluid container with max-w-6xl',
          specs: ['Sticky navigation header', 'CTA Button: Get Started', 'Zero cumulative layout shift']
        },
        visualLayout: {
          headerTitle: projectName,
          navItems: ['Features', 'Docs', 'Sign In'],
          contentBlocks: [
            { type: 'hero', label: 'Hero Banner & Core Value Prop', height: 60 },
            { type: 'card', label: 'Feature Highlights Grid (3 cards)', height: 50 }
          ],
          bottomNav: isMobileProject ? ['Home', 'Explore', 'Profile'] : undefined
        },
        actions: [
          { label: 'Click Sign Up', targetNodeId: 'modal-auth' },
          { label: 'Explore Directly', targetNodeId: 'screen-dashboard' }
        ]
      }
    },
    {
      id: 'modal-auth',
      type: 'modalFrame',
      position: { x: 700, y: 40 },
      data: {
        title: 'Authentication Dialog',
        subtitle: 'Sign In / Register Modal',
        actorRole: 'Guest',
        frameType: 'modal',
        uiGuidelines: {
          layout: 'Centered modal with backdrop-blur-md',
          colors: ['#131b2e', '#6366f1', '#10b981'],
          typography: 'Heading 18px Semi-bold',
          specs: ['OAuth 2.0 / Email passwordless', 'Accessible trap-focus', 'Escape key dismiss']
        },
        visualLayout: {
          headerTitle: 'Sign into ' + projectName,
          contentBlocks: [
            { type: 'form', label: 'Email & Password inputs', height: 45 },
            { type: 'card', label: 'Social Sign-In (GitHub / Google)', height: 35 }
          ]
        },
        actions: [
          { label: 'Auth Success', targetNodeId: 'screen-dashboard' }
        ]
      }
    },
    {
      id: 'screen-dashboard',
      type: defaultFrameType,
      position: { x: 1080, y: 50 },
      data: {
        title: 'Main Application Dashboard',
        subtitle: routes[1] || 'src/pages/dashboard',
        actorRole: 'User',
        frameType: isMobileProject ? 'mobile' : 'desktop',
        uiGuidelines: {
          layout: isMobileProject ? 'Header + Scrollable Cards' : 'Sidebar Navigation + Workspace Canvas',
          colors: ['#090d16', '#131b2e', '#6366f1', '#10b981'],
          typography: 'Inter / System UI, 14px primary',
          specs: ['Live SSE progress streaming', 'Filterable data table', 'Keyboard shortcuts']
        },
        visualLayout: {
          headerTitle: 'Dashboard Workspace',
          navItems: ['Overview', 'Tasks', 'Settings'],
          sidebarItems: isMobileProject ? undefined : ['Projects', 'Analytics', 'Team', 'API'],
          contentBlocks: [
            { type: 'stat', label: 'Metric KPI Cards (3 stats)', height: 35 },
            { type: 'table', label: 'Active Items & Progress Table', height: 70 }
          ],
          bottomNav: isMobileProject ? ['Dashboard', 'Activity', 'Settings'] : undefined
        }
      }
    }
  ];

  const edges: FlowEdge[] = [
    {
      id: 'e-actor-landing',
      source: 'actor-guest',
      target: 'screen-landing',
      label: 'Visits URL',
      animated: true
    },
    {
      id: 'e-landing-auth',
      source: 'screen-landing',
      target: 'modal-auth',
      label: 'Clicks "Sign In"'
    },
    {
      id: 'e-auth-dash',
      source: 'modal-auth',
      target: 'screen-dashboard',
      label: 'Authenticated',
      animated: true
    },
    {
      id: 'e-landing-dash',
      source: 'screen-landing',
      target: 'screen-dashboard',
      label: 'Guest Access / Demo'
    }
  ];

  const flows: UserFlow[] = [
    {
      id: 'main-user-journey',
      title: 'Primary User Onboarding & Dashboard Flow',
      actorRole: 'Guest & User',
      description: 'End-to-end journey from initial landing visit, auth modal verification, to main dashboard workspace.',
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
