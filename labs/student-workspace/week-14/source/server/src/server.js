import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createSqliteRequestService } from './services/sqliteRequestService.js';

const config = loadConfig();
const service = createSqliteRequestService({ filename: config.dbFile });

const server = createApp({
  service,
  corsOrigins: config.corsOrigins,
  allowDemoReset: config.allowDemoReset,
  rateLimit: config.rateLimit,
  trustProxy: config.trustProxy,
  staticDir: fileURLToPath(new URL('../../client/dist', import.meta.url)),
}).listen(config.port, () => {
  console.log(`Campus Service API (SQLite: ${config.dbFile}): http://localhost:${config.port}`);
});

// ปิดเซิร์ฟเวอร์และฐานข้อมูลให้เรียบร้อยเมื่อกด Ctrl+C
process.on('SIGINT', () => {
  server.close(() => {
    service.close();
    process.exit(0);
  });
});
