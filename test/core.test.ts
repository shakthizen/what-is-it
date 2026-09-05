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
  assert.ok(synthesized.tasks.length >= 3, 'Should synthesize at least 3 tasks');

  // Verify Why, How, Where, When on every synthesized task
  for (const task of synthesized.tasks) {
    assert.ok(task.why && task.why.length > 0, `Task ${task.id} must have a "why"`);
    assert.ok(task.how && task.how.length > 0, `Task ${task.id} must have a "how"`);
    assert.ok(task.where && task.where.length > 0, `Task ${task.id} must have a "where"`);
    assert.ok(task.when && task.when.length > 0, `Task ${task.id} must have a "when"`);
  }

  // Verify Wiki pages and bookmarks
  assert.ok(synthesized.wiki.length >= 2, 'Should synthesize at least 2 wiki pages');
  for (const page of synthesized.wiki) {
    assert.ok(page.bookmarks.length > 0, `Wiki page ${page.id} must have bookmarks for right-side nav`);
  }

  // Verify UserFlow and SVG frames
  assert.ok(synthesized.flows.length >= 1, 'Should synthesize at least 1 user flow');
  const mainFlow = synthesized.flows[0];
  assert.ok(mainFlow.nodes.some(n => n.type === 'desktopFrame' || n.type === 'mobileFrame'), 'Should have SVG frame nodes');
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
        order: 1
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
  assert.equal(loaded?.meta.overallProgress, 50, 'Overall progress should be 50% (1 of 2 tasks done)');
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
      version: '1.0.0',
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
        order: 1
      }
    ],
    tasks: [
      {
        id: 'task-1',
        featureId: 'core',
        title: 'Build CLI',
        status: 'done',
        priority: 'high',
        actorRole: 'Dev',
        why: 'Agent needs run commands',
        how: 'Commander',
        where: 'src/cli.ts',
        when: 'Now',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    ],
    wiki: [],
    flows: []
  };

  const output = formatCavemanStatus(sampleData);
  assert.ok(output.includes('UGG.') && output.includes('PROJECT:'), 'Output should contain caveman UGG. and PROJECT:');
  assert.ok(output.includes('TASKS:'), 'Output should show compact tasks summary');
  assert.ok(output.includes('AGENT COMMANDS:'), 'Output should show actionable CLI commands');

  const successMsg = formatCavemanSuccess('TASK COMPLETED', 'task-1');
  assert.ok(successMsg.includes('TASK COMPLETED') && successMsg.includes('task-1'));
});
