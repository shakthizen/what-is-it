import fs from 'node:fs';
import path from 'node:path';
import { loadProjectData, DEFAULT_FILE_NAME } from '../dist/core/index.js';

const rootDir = process.cwd();
const data = loadProjectData(rootDir, DEFAULT_FILE_NAME);

if (!data) {
  console.error('No .what-is-it.bin found. Run "npx what-is-it init" first.');
  process.exit(1);
}

const distWebDir = path.join(rootDir, 'dist', 'web');
const docsDir = path.join(rootDir, 'docs');

if (!fs.existsSync(distWebDir)) {
  console.error('dist/web does not exist. Run "pnpm build:web" first.');
  process.exit(1);
}

// 1. Write data.json into dist/web
fs.writeFileSync(path.join(distWebDir, 'data.json'), JSON.stringify(data, null, 2), 'utf-8');

// 2. Also copy dist/web to docs/ for zero-config GitHub Pages hosting from docs folder!
fs.cpSync(distWebDir, docsDir, { recursive: true });

// 3. Create .nojekyll in docs/ so GitHub Pages doesn't ignore _assets or dotfiles
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf-8');

console.log('✔ Statically exported web viewer & wiki to docs/ for GitHub Pages!');
