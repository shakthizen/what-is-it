import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installSkills, generateDynamicSkill, ALL_AGENT_TARGETS, DEFAULT_AGENT_TARGETS, parseAgentTargets } from '../src/cli/skills.js';
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
  assert.ok(skill.includes('/wii-init'), 'Skill should instruct about /wii-init');
  assert.ok(skill.includes('@shakthizen/what-is-it'), 'Skill should use scoped package @shakthizen/what-is-it');
  assert.ok(skill.includes('--why') && skill.includes('--how') && skill.includes('--where') && skill.includes('--when'), 'Skill should specify 4 Ws');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Multi-Agent Installation creates slash commands and rules across ecosystems when all agents selected', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-multi-'));
  const meta = {
    name: 'UniversalApp',
    description: 'Cross-agent test',
    projectType: 'web' as const,
    frameworks: ['React'],
    architectureSummary: '',
    version: '1.0.0',
    updatedAt: '',
    overallProgress: 0
  };

  const { skillPath, slashCommands, rulesUpdated } = installSkills({
    rootDir: tmpDir,
    meta,
    agents: ALL_AGENT_TARGETS
  });

  // Antigravity workflows
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'wii-init.md')), 'Antigravity /wii-init workflow should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'wii-status.md')), 'Antigravity /wii-status workflow should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.agent', 'workflows', 'wii-task-done.md')), 'Antigravity /wii-task-done workflow should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, 'GEMINI.md')), 'GEMINI.md should exist');

  // Claude Code: real skill path + slash commands
  assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'skills', 'what-is-it', 'SKILL.md')), 'Claude Code skill should exist at .claude/skills/what-is-it/SKILL.md');
  assert.equal(skillPath, path.join(tmpDir, '.claude', 'skills', 'what-is-it', 'SKILL.md'));
  assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'wii-init.md')), 'Claude Code /wii-init command should exist');

  // Cursor rules
  assert.ok(fs.existsSync(path.join(tmpDir, '.cursor', 'rules', 'what-is-it.mdc')), 'Cursor .mdc rule should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.cursorrules')), '.cursorrules should exist');

  // Windsurf / Cline / Copilot
  assert.ok(fs.existsSync(path.join(tmpDir, '.windsurfrules')), '.windsurfrules should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.clinerules')), '.clinerules should exist');
  assert.ok(fs.existsSync(path.join(tmpDir, '.github', 'copilot-instructions.md')), 'copilot-instructions.md should exist');

  // Generic rule files
  assert.ok(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), 'AGENTS.md should exist');
  const agentsContent = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
  assert.ok(agentsContent.includes('@shakthizen/what-is-it'), 'AGENTS.md should have @shakthizen/what-is-it');
  assert.ok(agentsContent.includes('SESSION START / ORIENTATION'), 'AGENTS.md should have orientation guideline');
  assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')), 'CLAUDE.md should exist');

  // scratch/ must be git-ignored so a failed/skipped import can't leak the deep-pass JSON into a commit
  const gitignore = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
  assert.ok(gitignore.includes('scratch/'), '.gitignore should ignore scratch/');

  assert.ok(slashCommands.includes('/wii-init'));
  assert.ok(slashCommands.includes('/wii-status'));

  // Test re-install cleanly updates existing AGENTS.md without duplicates
  const secondInstall = installSkills({ rootDir: tmpDir, meta, agents: ALL_AGENT_TARGETS });
  assert.ok(secondInstall.rulesUpdated.includes('AGENTS.md'), 'Re-install should update AGENTS.md');
  const updatedAgents = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
  const occurrences = (updatedAgents.match(/<!-- WHAT_IS_IT_START -->/g) || []).length;
  assert.equal(occurrences, 1, 'Should have exactly one WHAT_IS_IT_START block without duplication');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Selective agent installation only writes files for chosen agents', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-selective-'));

  const { skillPath, slashCommands, rulesUpdated } = installSkills({
    rootDir: tmpDir,
    agents: ['cursor']
  });

  assert.ok(fs.existsSync(path.join(tmpDir, '.cursor', 'rules', 'what-is-it.mdc')), 'Cursor rule should be installed');
  assert.ok(fs.existsSync(path.join(tmpDir, '.cursorrules')), '.cursorrules should be installed');
  assert.equal(skillPath, undefined, 'No Claude Code skill path when claude was not selected');
  assert.equal(slashCommands.length, 0, 'Cursor has no slash-command mechanism, so none should be installed');
  assert.ok(!fs.existsSync(path.join(tmpDir, '.claude')), '.claude/ should not be created when claude was not selected');
  assert.ok(!fs.existsSync(path.join(tmpDir, '.agent')), '.agent/ should not be created when antigravity was not selected');
  assert.ok(!fs.existsSync(path.join(tmpDir, 'AGENTS.md')), 'AGENTS.md should not be created when agents-md was not selected');
  assert.deepEqual(rulesUpdated, ['.cursorrules']);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Default agent target is the generic AGENTS.md only, not every ecosystem', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-default-'));

  const { skillPath, slashCommands, rulesUpdated } = installSkills({ rootDir: tmpDir });

  assert.deepEqual(DEFAULT_AGENT_TARGETS, ['agents-md']);
  assert.ok(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), 'AGENTS.md should be installed by default');
  assert.equal(skillPath, undefined);
  assert.equal(slashCommands.length, 0);
  assert.deepEqual(rulesUpdated, ['AGENTS.md']);
  assert.ok(!fs.existsSync(path.join(tmpDir, '.claude')));
  assert.ok(!fs.existsSync(path.join(tmpDir, '.cursor')));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('parseAgentTargets parses lists, "all", and rejects unknown ids', () => {
  assert.deepEqual(parseAgentTargets('claude,cursor'), ['claude', 'cursor']);
  assert.deepEqual(parseAgentTargets('all'), ALL_AGENT_TARGETS);
  assert.deepEqual(parseAgentTargets('claude, bogus-agent'), ['claude']);
  assert.equal(parseAgentTargets('totally-bogus'), null);
  assert.equal(parseAgentTargets(undefined), null);
  assert.equal(parseAgentTargets(''), null);
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
