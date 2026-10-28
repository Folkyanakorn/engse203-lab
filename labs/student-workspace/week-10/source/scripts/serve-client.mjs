// static server เล็ก ๆ สำหรับ client/ (ไม่ต้องติดตั้งเพิ่ม) ใช้ origin คนละพอร์ตกับ API เพื่อทดสอบ CORS จริง
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../client/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PORT = Number(process.env.CLIENT_PORT ?? 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = normalize(pathname === '/' ? 'index.html' : pathname).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(ROOT, relative));
    res.writeHead(200, { 'Content-Type': TYPES[extname(relative)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => console.log(`Client: http://localhost:${PORT}`));
