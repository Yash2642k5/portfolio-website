import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { build } from './build.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mjs': 'application/javascript',
};

createServer(async (req, res) => {
  const pathname = req.url.split('?')[0];
  const url = pathname === '/' ? '/index.html' : pathname;

  // Rebuild index.html from template.html + partials/*.html on every
  // request for it, so editing the source files is reflected immediately —
  // no manual `node build.mjs` step needed during dev.
  if (url === '/index.html') {
    try {
      await build();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Build failed:\n${err.stack || err}`);
      return;
    }
  }

  const filePath = join(__dirname, url);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`Serving at http://localhost:${PORT}`));
