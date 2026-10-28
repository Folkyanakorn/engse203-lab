import { existsSync } from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import { createRequestRoutes } from './routes/requestRoutes.js';
import { logger } from './middleware/logger.js';
import { createCors } from './middleware/cors.js';
import { createRateLimiters } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp({ service, corsOrigins = [], enableLogger = true, staticDir, allowDemoReset = false, rateLimit = {}, trustProxy = false } = {}) {
  const app = express();

  app.disable('x-powered-by');
  // อยู่หลัง reverse proxy (เช่น Nginx/Render) ต้องตั้ง trust proxy เพื่อให้ rate limit เห็น IP จริงของผู้ใช้
  if (trustProxy) app.set('trust proxy', trustProxy);
  if (enableLogger) app.use(logger);
  // security headers: CSP, X-Content-Type-Options, X-Frame-Options (frame-ancestors), HSTS ฯลฯ
  app.use(helmet());
  app.use(createCors(corsOrigins));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '1.2.0' });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
  });

  // จำกัดจำนวน request ต่อ IP: ทั้งหมดของ /api และเข้มกว่าสำหรับการเขียน (POST/PUT/PATCH/DELETE)
  const { general, writes } = createRateLimiters(rateLimit);
  app.use('/api', general);
  app.use('/api', (req, res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : writes(req, res, next)));

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
