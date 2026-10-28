import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { createMongoRequestService } from './services/mongoRequestService.js';

const config = loadConfig();

try {
  await connectDb(config.mongoUri);
} catch (error) {
  console.error(`เชื่อมต่อ MongoDB ไม่สำเร็จ: ${error.message}`);
  process.exit(1);
}

const service = createMongoRequestService();
await service.seedIfEmpty();

const server = createApp({ service, corsOrigins: config.corsOrigins }).listen(config.port, () => {
  console.log(`Campus Service API (MongoDB): http://localhost:${config.port}`);
});

process.on('SIGINT', () => {
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
});
