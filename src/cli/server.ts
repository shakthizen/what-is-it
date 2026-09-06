import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import open from 'open';
import pc from 'picocolors';
import { loadProjectData, saveProjectData, DEFAULT_FILE_NAME } from '../core/storage.js';
import { validateProjectData } from '../core/schema.js';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

export function startServer(rootDir: string, port: number = 3456, shouldOpen: boolean = true) {
  const binPath = path.resolve(rootDir, DEFAULT_FILE_NAME);
  if (!fs.existsSync(binPath)) {
    console.error(pc.red(`Error: ${DEFAULT_FILE_NAME} not found in ${rootDir}. Run 'npx what-is-it init' first.`));
    process.exit(1);
  }

  // Determine web static assets directory
  // In production, compiled web assets live in <dist>/web
  // We check relative to current file or rootDir
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  let webDistDir = path.resolve(currentDir, '..', 'web');
  if (!fs.existsSync(path.join(webDistDir, 'index.html'))) {
    // Fallback: check project root dist/web
    const fallbackDir = path.resolve(currentDir, '..', '..', 'dist', 'web');
    if (fs.existsSync(path.join(fallbackDir, 'index.html'))) {
      webDistDir = fallbackDir;
    }
  }

  // SSE Clients
  const sseClients = new Set<http.ServerResponse>();

  function broadcastUpdate() {
    const message = `data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(message);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Watch .what-is-it.bin for external changes (e.g. from agent CLI)
  let watchDebounce: NodeJS.Timeout | null = null;
  fs.watch(rootDir, (eventType, filename) => {
    if (filename === DEFAULT_FILE_NAME) {
      if (watchDebounce) clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        broadcastUpdate();
      }, 150);
    }
  });

  // Only this project's own web bundle (served same-origin from this port) may call the
  // API. Any other Origin/Referer — e.g. a page open in another tab, or a malicious site
  // relying on the browser having a local dashboard running — is rejected outright. This
  // closes the CSRF/data-exfiltration hole a wildcard `Access-Control-Allow-Origin: *`
  // combined with an unauthenticated write API would otherwise open on localhost.
  function isTrustedOrigin(req: http.IncomingMessage): boolean {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const header = origin || referer;
    // No Origin/Referer at all means a same-origin navigation or a non-browser client
    // (curl, the CLI itself) — allow it. Browsers always send Origin on cross-origin fetch.
    if (!header) return true;
    try {
      const url = new URL(header);
      return (url.hostname === 'localhost' || url.hostname === '127.0.0.1') && Number(url.port) === port;
    } catch {
      return false;
    }
  }

  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://localhost:${port}`);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/api/') && !isTrustedOrigin(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Cross-origin requests to the local what-is-it API are not allowed.' }));
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // SSE Endpoint
    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('data: {"connected": true}\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // API: GET /api/project
    if (pathname === '/api/project' && req.method === 'GET') {
      try {
        const data = loadProjectData(rootDir);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    // API: POST /api/project (full update)
    if (pathname === '/api/project' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body);
          if (!validateProjectData(incoming)) {
            throw new Error('Payload does not match the expected project data shape');
          }
          saveProjectData(rootDir, incoming);
          broadcastUpdate();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
      });
      return;
    }

    // API: POST /api/task/toggle
    if (pathname === '/api/task/toggle' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { taskId } = JSON.parse(body);
          const current = loadProjectData(rootDir);
          if (!current) throw new Error('Project data not found');

          const task = current.tasks?.find(t => t.id === taskId);
          if (!task) throw new Error(`Task ${taskId} not found`);

          task.status = task.status === 'done' ? 'todo' : 'done';
          if (task.status === 'done') {
            task.completedAt = new Date().toISOString();
          } else {
            delete task.completedAt;
          }

          // Tasks are a legacy mirror of SubFeatures. Progress is computed from
          // SubFeature.status, so without this the checkbox would flip visually
          // but never move the actual completion percentage.
          if (task.subFeatureId) {
            for (const feature of current.features) {
              const sub = feature.subFeatures?.find(sf => sf.id === task.subFeatureId);
              if (sub) {
                sub.status = task.status === 'done' ? 'implemented' : 'missing';
                break;
              }
            }
          }

          saveProjectData(rootDir, current);
          broadcastUpdate();

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, task }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
      });
      return;
    }

    // Prevent path traversal
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(webDistDir, safePath === '/' || safePath === '' ? 'index.html' : safePath);

    // If file doesn't exist directly and is not an API call, fallback to index.html for SPA routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(webDistDir, 'index.html');
    }

    // Enforce that filePath must be within webDistDir
    const resolvedPath = path.resolve(filePath);
    const resolvedDist = path.resolve(webDistDir);
    if (!resolvedPath.startsWith(resolvedDist)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Web bundle not found. Please ensure what-is-it web assets are built.');
    }
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(pc.yellow(`⚠️ Port ${port} is in use, attempting port ${port + 1}...`));
      startServer(rootDir, port + 1, shouldOpen);
    } else {
      console.error(pc.red(`Server error: ${err.message}`));
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n${pc.bold(pc.green('🚀 what-is-it web viewer running!'))}`);
    console.log(`   ${pc.bold('Local URL:')}     ${pc.cyan(url)}`);
    console.log(`   ${pc.bold('State File:')}    ${pc.dim(binPath)}`);
    console.log(`   ${pc.bold('Live Updates:')}  ${pc.magenta('Active (SSE)')}\n`);

    if (shouldOpen) {
      open(url).catch(() => {
        // Ignore open failures in headless environments
      });
    }
  });

  return server;
}
