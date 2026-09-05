import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installSkills, generateDynamicSkill } from '../src/cli/skills.js';
import { getProjectJsonSchema } from '../src/core/schema.js';

test('Dynamic Skill Generation embeds exact project-specific paths', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-skill-'));

  const skill = generateDynamicSkill({
    rootDir: tmpDir,
    meta: {
      name: 'SuperApp',
      description: 'Test app',
      projectType: 'mobile',
      frameworks: ['Flutter', 'Dart'],
      architectureSummary: '',
      version: '1.0.0',
      updatedAt: '',
      overallProgress: 0
    }
  });

  assert.ok(skill.includes('SuperApp'), 'Skill should include project name');
  assert.ok(skill.includes('mobile'), 'Skill should include project type');
  assert.ok(skill.includes('Flutter, Dart'), 'Skill should include frameworks');
  assert.ok(skill.includes(tmpDir), 'Skill should include absolute path to binary');
  assert.ok(skill.includes('/what-is-it-init'), 'Skill should instruct about /what-is-it-init');
  assert.ok(skill.includes('@shakthizen/what-is-it'), 'Skill should use scoped package @shakthizen/what-is-it');
  assert.ok(skill.includes('--why') && skill.includes('--how') && skill.includes('--where') && skill.includes('--when'), 'Skill should specify 4 Ws');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Multi-Agent Installation creates slash commands and rules across ecosystems', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-multi-'));

  const { skillPath, slashCommands, rulesUpdated } = installSkills({
    rootDir: tmpDir,
    meta: {
      name: 'UniversalApp',
      description: 'Cross-agent test',
      projectType: 'web',
      frameworks: ['React'],
      architectureSummary: '',
      version: '1.0.0',
      updatedAt: '',
      overallProgress: 0
    }
  });

  // Antigravity workflows
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'what-is-it-init.md')), 'Antigravity /what-is-it-init workflow should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'status.md')), 'Antigravity /status workflow should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'task-done.md')), 'Antigravity /task-done workflow should exist');

  // Claude Code commands
  assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'what-is-it-init.md')), 'Claude Code /what-is-it-init command should exist');

  // Cursor rules
  assert.ok(fs.existsSync(path.join(tmpDir, '.cursor', 'rules', 'what-is-it.mdc')), 'Cursor .mdc rule should exist');

  // Rule files
  assert.ok(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), 'AGENTS.md should exist');
  const agentsContent = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
  assert.ok(agentsContent.includes('@shakthizen/what-is-it'), 'AGENTS.md should have @shakthizen/what-is-it');
  assert.ok(agentsContent.includes('SESSION START / ORIENTATION'), 'AGENTS.md should have orientation guideline');
  assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')), 'CLAUDE.md should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.cursorrules')), '.cursorrules should exist');

  assert.ok(slashCommands.includes('/what-is-it-init'));
  assert.ok(slashCommands.includes('/status'));

  // Test re-install cleanly updates existing AGENTS.md without duplicates
  const secondInstall = installSkills({
    rootDir: tmpDir,
    meta: {
      name: 'UniversalApp',
      description: 'Cross-agent test',
      projectType: 'web',
      frameworks: ['React'],
      architectureSummary: '',
      version: '1.0.0',
      updatedAt: '',
      overallProgress: 0
    }
  });
  assert.ok(secondInstall.rulesUpdated.includes('AGENTS.md'), 'Re-install should update AGENTS.md');
  const updatedAgents = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
  const occurrences = (updatedAgents.match(/<!-- WHAT_IS_IT_START -->/g) || []).length;
  assert.equal(occurrences, 1, 'Should have exactly one WHAT_IS_IT_START block without duplication');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getProjectJsonSchema returns valid JSON schema for agents', () => {
  const schema = getProjectJsonSchema();
  assert.equal(schema.type, 'object');
  assert.ok(schema.properties.schemaVersion);
  assert.ok(schema.properties.meta);
  assert.ok(schema.properties.features);
  assert.ok(schema.properties.tasks);
  assert.ok(schema.properties.wiki);
  assert.ok(schema.properties.flows);
});
