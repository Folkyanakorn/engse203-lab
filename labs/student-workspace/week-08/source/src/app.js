import express from 'express';
import { createRequestRoutes } from './routes/requestRoutes.js';
import { logger } from './middleware/logger.js';
import { createCors } from './middleware/cors.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp({ service, corsOrigins = [], enableLogger = true } = {}) {
  const app = express();

  app.disable('x-powered-by');
  if (enableLogger) app.use(logger);
  app.use(createCors(corsOrigins));
  app.use(express.json({ limit: '10kb' }));

  app.get('/', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '1.2.0' });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
  });

  app.use('/api/requests', createRequestRoutes(service));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
