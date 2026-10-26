import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const root = path.resolve('out');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.webm':'video/webm','.vtt':'text/vtt; charset=utf-8','.avif':'image/avif','.jpg':'image/jpeg'};
const cache = new Map();
http.createServer((request, response) => {
 try {
  let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  let status = 200;
  if (!fs.existsSync(file)) { file = path.join(root, '404.html'); status = 404; }
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  const ext = path.extname(file);
  const compressed = (request.headers['accept-encoding'] || '').includes('gzip') && ['.html','.js','.css','.json','.txt','.svg'].includes(ext);
  const key = file + ':' + compressed;
  if (!cache.has(key)) { const bytes = fs.readFileSync(file); cache.set(key, compressed ? gzipSync(bytes) : bytes); }
  const body = cache.get(key);
  response.writeHead(status, {'Content-Type': types[ext] || 'application/octet-stream', 'Content-Length': body.length, 'Vary': 'Accept-Encoding', ...(compressed ? {'Content-Encoding':'gzip'} : {})});
  response.end(request.method === 'HEAD' ? undefined : body);
 } catch { response.writeHead(400).end(); }
}).listen(Number(process.env.PORT || 4175), '127.0.0.1', () => console.log('Static export server ready (gzip, custom 404)'));
