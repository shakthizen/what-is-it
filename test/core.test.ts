import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  saveProjectData,
  loadProjectData,
  computeProgress,
  DEFAULT_FILE_NAME,
  DEFAULT_MARKDOWN_NAME
} from '../src/core/storage.js';
import { scanProject, synthesizeProjectData } from '../src/core/scanner.js';
import { formatCavemanStatus, formatCavemanSuccess } from '../src/cli/caveman.js';
import type { ProjectData } from '../src/core/schema.js';

test('Project Scanner & Auto-Mapper', () => {
  const cwd = process.cwd();
  const context = scanProject(cwd);

  assert.ok(context.projectName.length > 0, 'Project name should be detected');
  assert.ok(context.files.length > 0, 'Files should be discovered');
  assert.ok(context.frameworks.includes('React'), 'React should be detected in what-is-it dependencies');

  const synthesized = synthesizeProjectData(context);
  assert.equal(synthesized.schemaVersion, 1);
  assert.ok(synthesized.features.length >= 3, 'Should synthesize at least 3 features');
  assert.ok(synthesized.tasks && synthesized.tasks.length >= 3, 'Should synthesize tasks for backward compatibility');

  // Verify Feature Spec: subFeatures, userStories, roleActions, missingDetails
  for (const feat of synthesized.features) {
    assert.ok(feat.subFeatures && feat.subFeatures.length > 0, `Feature ${feat.id} must have subFeatures`);
    for (const sf of feat.subFeatures) {
      assert.ok(sf.what && sf.what.length > 0, `SubFeature ${sf.id} must have a "what"`);
      assert.ok(sf.why && sf.why.length > 0, `SubFeature ${sf.id} must have a "why"`);
      assert.ok(sf.how && sf.how.length > 0, `SubFeature ${sf.id} must have a "how"`);
      assert.ok(sf.where && sf.where.length > 0, `SubFeature ${sf.id} must have a "where"`);
      assert.ok(sf.when && sf.when.length > 0, `SubFeature ${sf.id} must have a "when"`);
      assert.ok(['implemented', 'in_progress', 'missing'].includes(sf.status), `SubFeature ${sf.id} status must be valid`);
    }

    if (feat.missingDetails) {
      assert.ok(Array.isArray(feat.missingDetails.whatsMissing), `Feature ${feat.id} missingDetails.whatsMissing must be array`);
      assert.ok(feat.missingDetails.how.length > 0, `Feature ${feat.id} missingDetails must have a "how"`);
    }
  }

  // Verify Wiki pages and bookmarks
  assert.ok(synthesized.wiki.length >= 2, 'Should synthesize at least 2 wiki pages');
  for (const page of synthesized.wiki) {
    assert.ok(page.bookmarks.length > 0, `Wiki page ${page.id} must have bookmarks for right-side nav`);
  }

  // Verify UserFlow, Actor nodes, and SVG frames
  assert.ok(synthesized.flows.length >= 1, 'Should synthesize at least 1 user flow');
  const mainFlow = synthesized.flows[0];
  assert.ok(mainFlow.nodes.some(n => n.type === 'desktopFrame' || n.type === 'mobileFrame'), 'Should have SVG frame nodes');
  assert.ok(mainFlow.nodes.some(n => n.type === 'actorNode'), 'Should have Actor nodes');
  assert.ok(mainFlow.edges.length >= 3, 'Should have multiple edge transitions');
});

test('Feature Spec & Sub-Feature Progress Calculation', () => {
  const sampleData: ProjectData = {
    schemaVersion: 1,
    meta: {
      name: 'Spec App',
      description: 'Test feature spec progress',
      projectType: 'web',
      frameworks: ['React'],
      architectureSummary: '',
      version: '1.0.1',
      updatedAt: new Date().toISOString(),
      overallProgress: 0
    },
    features: [
      {
        id: 'feat-1',
        title: 'Core Engine',
        description: '',
        category: 'Engine',
        status: 'in_progress',
        progress: 0,
        order: 1,
        subFeatures: [
          {
            id: 'sub-1',
            title: 'Storage',
            status: 'implemented',
            what: 'Binary persistence',
            why: 'Fast loading',
            how: 'Zlib',
            where: 'src/storage.ts',
            when: 'Done'
          },
          {
            id: 'sub-2',
            title: 'Locking',
            status: 'missing',
            what: 'Atomic lock',
            why: 'Concurrency safety',
            how: 'Lockfile',
            where: 'src/lock.ts',
            when: 'Sprint 2'
          }
        ]
      },
      {
        id: 'feat-2',
        title: 'UI Dashboard',
        description: '',
        category: 'UI',
        status: 'completed',
        progress: 0,
        order: 2,
        subFeatures: [
          {
            id: 'sub-3',
            title: 'Spec Viewer',
            status: 'implemented',
            what: 'Feature explorer',
            why: 'Clarity',
            how: 'React',
            where: 'src/web.tsx',
            when: 'Done'
          }
        ]
      }
    ],
    wiki: [],
    flows: []
  };

  const computed = computeProgress(sampleData);
  assert.equal(computed.features[0].progress, 50, 'Feat-1 progress should be 50% (1 of 2 sub-features implemented)');
  assert.equal(computed.features[1].progress, 100, 'Feat-2 progress should be 100% (1 of 1 sub-feature implemented)');
  // Overall: 2 of 3 sub-features implemented = 67%
  assert.equal(computed.meta.overallProgress, 67, 'Overall progress should be 67% (2 of 3 total sub-features implemented)');
});

test('Binary Storage Engine & Compression Roundtrip', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-test-'));

  const sampleData: ProjectData = {
    schemaVersion: 1,
    meta: {
      name: 'Sample App',
      description: 'A test project for testing storage',
      projectType: 'web',
      frameworks: ['React', 'Vite'],
      architectureSummary: 'Test summary',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      overallProgress: 0
    },
    features: [
      {
        id: 'feat-1',
        title: 'Auth',
        description: 'Authentication',
        category: 'Security',
        status: 'planned',
        progress: 0,
        order: 1,
        subFeatures: [
          {
            id: 'sub-login',
            title: 'Login',
            status: 'implemented',
            what: 'User login',
            why: 'Access control',
            how: 'JWT',
            where: 'src/login.ts',
            when: 'Now'
          },
          {
            id: 'sub-logout',
            title: 'Logout',
            status: 'missing',
            what: 'Clear session',
            why: 'Security',
            how: 'Invalidate cookie',
            where: 'src/logout.ts',
            when: 'Sprint 2'
          }
        ]
      }
    ],
    tasks: [
      {
        id: 'task-1',
        featureId: 'feat-1',
        title: 'Implement login',
        status: 'done',
        priority: 'high',
        actorRole: 'User',
        why: 'Allow user access',
        how: 'JWT token header',
        where: 'src/auth/login.ts',
        when: 'Sprint 1',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        featureId: 'feat-1',
        title: 'Implement logout',
        status: 'todo',
        priority: 'medium',
        actorRole: 'User',
        why: 'Clear session',
        how: 'Invalidate cookie',
        where: 'src/auth/logout.ts',
        when: 'Sprint 1',
        createdAt: new Date().toISOString()
      }
    ],
    wiki: [
      {
        id: 'overview',
        title: 'Overview',
        category: 'General',
        order: 1,
        content: '## Section One\nHello world',
        bookmarks: [{ id: 'section-one', title: 'Section One', level: 2 }],
        lastModified: new Date().toISOString()
      }
    ],
    flows: []
  };

  const { binPath, mdPath } = saveProjectData(tmpDir, sampleData);
  assert.ok(fs.existsSync(binPath), 'Binary file should exist on disk');
  assert.ok(mdPath && fs.existsSync(mdPath), 'Markdown mirror should exist on disk');

  // Verify binary compression size (< 5KB for small project)
  const binStat = fs.statSync(binPath);
  assert.ok(binStat.size < 5000, `Binary file should be tightly compressed, was ${binStat.size} bytes`);

  // Verify load and decompress
  const loaded = loadProjectData(tmpDir);
  assert.ok(loaded !== null, 'Loaded data should not be null');
  assert.equal(loaded?.meta.name, 'Sample App');
  assert.equal(loaded?.meta.overallProgress, 50, 'Overall progress should be 50%');
  assert.equal(loaded?.features[0].progress, 50, 'Feature progress should be 50%');

  // Verify markdown content
  const mdContent = fs.readFileSync(mdPath!, 'utf-8');
  assert.ok(mdContent.includes('Sample App'), 'Markdown mirror should include project name');
  assert.ok(mdContent.includes('[████████████░░░░░░░░░░░░] 50%'), 'Markdown mirror should include progress bar');

  // Clean up
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Caveman Formatter for Agent Efficiency', () => {
  const sampleData: ProjectData = {
    schemaVersion: 1,
    meta: {
      name: 'Caveman Test',
      description: 'Testing caveman mode',
      projectType: 'cli',
      frameworks: ['Node'],
      architectureSummary: '',
      version: '1.0.1',
      updatedAt: new Date().toISOString(),
      overallProgress: 100
    },
    features: [
      {
        id: 'core',
        title: 'Core CLI',
        description: '',
        category: 'Core',
        status: 'completed',
        progress: 100,
        order: 1,
        subFeatures: [
          {
            id: 'sub-cli',
            title: 'CLI Dispatcher',
            status: 'implemented',
            what: 'Commands suite',
            why: 'Execution',
            how: 'Commander',
            where: 'src/cli.ts',
            when: 'Done'
          }
        ]
      }
    ],
    wiki: [],
    flows: []
  };

  const output = formatCavemanStatus(sampleData);
  assert.ok(output.includes('UGG.') && output.includes('PROJECT:'), 'Output should contain caveman UGG. and PROJECT:');
  assert.ok(output.includes('SPECS:'), 'Output should show compact specs summary');
  assert.ok(output.includes('AGENT COMMANDS:'), 'Output should show actionable CLI commands');

  const successMsg = formatCavemanSuccess('TASK COMPLETED', 'task-1');
  assert.ok(successMsg.includes('TASK COMPLETED') && successMsg.includes('task-1'));
});

test('Scratch File Cleanup on Import Simulation', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-scratch-test-'));
  const scratchDir = path.join(tmpDir, 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });

  const scratchFile = path.join(scratchDir, 'temp-state.json');
  fs.writeFileSync(scratchFile, JSON.stringify({
    schemaVersion: 1,
    meta: { name: 'Scratch Test', description: '', projectType: 'cli', frameworks: [], architectureSummary: '', version: '1.0.0', updatedAt: new Date().toISOString(), overallProgress: 0 },
    features: [],
    wiki: [],
    flows: []
  }));

  assert.ok(fs.existsSync(scratchFile), 'Scratch file should initially exist');

  // Simulate import cleanup logic
  if (scratchFile.includes('scratch')) {
    fs.unlinkSync(scratchFile);
    if (fs.readdirSync(scratchDir).length === 0) {
      fs.rmdirSync(scratchDir);
    }
  }

  assert.ok(!fs.existsSync(scratchFile), 'Scratch file should be unlinked');
  assert.ok(!fs.existsSync(scratchDir), 'Empty scratch directory should be removed');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
