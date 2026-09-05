import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadProjectData, saveProjectData } from '../src/core/storage.js';
import type { ProjectData } from '../src/core/schema.js';

test('Security: Corrupt binary or invalid magic header throws clean error', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-sec-'));
  const binPath = path.join(tmpDir, '.what-is-it.bin');

  // Write corrupt bytes
  fs.writeFileSync(binPath, Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]));

  assert.throws(() => {
    loadProjectData(tmpDir);
  }, /Failed to decompress and parse/);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Security: File too small throws clean error', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-sec-'));
  const binPath = path.join(tmpDir, '.what-is-it.bin');

  // Write 2 bytes
  fs.writeFileSync(binPath, Buffer.from([0x57, 0x49]));

  assert.throws(() => {
    loadProjectData(tmpDir);
  }, /is corrupted \(too small\)/);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Concurrency: Rapid sequential saves do not corrupt binary state', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wit-sec-'));

  const baseData: ProjectData = {
    schemaVersion: 1,
    meta: {
      name: 'Stress Test',
      description: 'Testing rapid writes',
      projectType: 'cli',
      frameworks: [],
      architectureSummary: '',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      overallProgress: 0
    },
    features: [],
    tasks: [],
    wiki: [],
    flows: []
  };

  for (let i = 0; i < 20; i++) {
    baseData.tasks.push({
      id: `task-${i}`,
      featureId: 'feat',
      title: `Task ${i}`,
      status: 'done',
      priority: 'low',
      actorRole: 'User',
      why: 'Why',
      how: 'How',
      where: 'Where',
      when: 'When',
      createdAt: new Date().toISOString()
    });
    saveProjectData(tmpDir, baseData);
  }

  const loaded = loadProjectData(tmpDir);
  assert.equal(loaded?.tasks.length, 20);
  assert.equal(loaded?.meta.overallProgress, 100);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
