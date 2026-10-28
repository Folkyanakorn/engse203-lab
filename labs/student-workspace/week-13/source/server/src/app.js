import { existsSync } from 'node:fs';
import express from 'express';
import { createRequestRoutes } from './routes/requestRoutes.js';
import { logger } from './middleware/logger.js';
import { createCors } from './middleware/cors.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp({ service, corsOrigins = [], enableLogger = true, staticDir, allowDemoReset = false } = {}) {
  const app = express();

  app.disable('x-powered-by');
  if (enableLogger) app.use(logger);
  app.use(createCors(corsOrigins));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '1.2.0' });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
  });

  app.use('/api/requests', createRequestRoutes(service));

  // รีเซ็ตข้อมูลตัวอย่างสำหรับ LAB เท่านั้น: ปิดไว้เป็นค่าเริ่มต้น (เปิดด้วย ALLOW_DEMO_RESET=true)
  app.post('/api/demo/reset', async (req, res) => {
    if (!allowDemoReset) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'ปิดการรีเซ็ตข้อมูลตัวอย่างอยู่' } });
    }
    await service.reset();
    res.status(200).json({ message: 'reset แล้ว', stats: await service.stats() });
  });

  // production: เสิร์ฟ React build (client/dist) ที่ origin เดียวกับ API
  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
