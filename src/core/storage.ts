import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { ProjectData } from './schema.js';
import { generateMarkdownOverview } from './markdown.js';

export const DEFAULT_FILE_NAME = '.what-is-it.bin';
export const DEFAULT_MARKDOWN_NAME = 'WHAT_IS_IT.md';
const MAGIC_HEADER = Buffer.from([0x57, 0x49, 0x54, 0x31]); // 'WIT1'

export function computeProgress(data: ProjectData): ProjectData {
  const updatedData = { ...data };
  const { tasks, features } = updatedData;

  // Compute feature progress
  updatedData.features = features.map(feat => {
    const featTasks = tasks.filter(t => t.featureId === feat.id);
    if (featTasks.length === 0) {
      return feat;
    }
    const doneTasks = featTasks.filter(t => t.status === 'done').length;
    const progress = Math.round((doneTasks / featTasks.length) * 100);
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : feat.status;
    return {
      ...feat,
      progress,
      status
    };
  });

  // Compute overall progress
  if (tasks.length === 0) {
    updatedData.meta.overallProgress = 0;
  } else {
    const totalDone = tasks.filter(t => t.status === 'done').length;
    updatedData.meta.overallProgress = Math.round((totalDone / tasks.length) * 100);
  }

  updatedData.meta.updatedAt = new Date().toISOString();
  return updatedData;
}

export function saveProjectData(
  targetDir: string,
  data: ProjectData,
  fileName: string = DEFAULT_FILE_NAME,
  generateMirror: boolean = true
): { binPath: string; mdPath?: string } {
  const computed = computeProgress(data);
  const jsonStr = JSON.stringify(computed);
  const compressed = zlib.deflateSync(Buffer.from(jsonStr, 'utf-8'), { level: 9 });

  const binBuffer = Buffer.concat([MAGIC_HEADER, compressed]);
  const binPath = path.resolve(targetDir, fileName);
  const tmpPath = `${binPath}.tmp-${Date.now()}`;

  // Atomic write
  fs.writeFileSync(tmpPath, binBuffer);
  fs.renameSync(tmpPath, binPath);

  let mdPath: string | undefined;
  if (generateMirror) {
    const mdContent = generateMarkdownOverview(computed);
    mdPath = path.resolve(targetDir, DEFAULT_MARKDOWN_NAME);
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
  }

  return { binPath, mdPath };
}

export function loadProjectData(
  targetDir: string,
  fileName: string = DEFAULT_FILE_NAME
): ProjectData | null {
  const binPath = path.resolve(targetDir, fileName);
  if (!fs.existsSync(binPath)) {
    return null;
  }

  const rawBuffer = fs.readFileSync(binPath);
  if (rawBuffer.length < 4) {
    throw new Error(`File ${binPath} is corrupted (too small)`);
  }

  // Check magic header
  let payload: Buffer;
  if (rawBuffer.subarray(0, 4).equals(MAGIC_HEADER)) {
    payload = rawBuffer.subarray(4);
  } else {
    // Fallback: try raw zlib in case header was omitted
    payload = rawBuffer;
  }

  try {
    const decompressed = zlib.inflateSync(payload);
    const parsed = JSON.parse(decompressed.toString('utf-8')) as ProjectData;
    return computeProgress(parsed);
  } catch (err) {
    throw new Error(`Failed to decompress and parse ${binPath}: ${(err as Error).message}`);
  }
}

export function projectExists(targetDir: string, fileName: string = DEFAULT_FILE_NAME): boolean {
  return fs.existsSync(path.resolve(targetDir, fileName));
}
