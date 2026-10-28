import express from 'express';
import { createRequestRoutes } from './routes/requestRoutes.js';
import { logger } from './middleware/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp({ service, enableLogger = true } = {}) {
  const app = express();

  if (enableLogger) app.use(logger);
  app.use(express.json({ limit: '10kb' }));

  app.get('/', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '1.1.0' });
  });

  app.use('/api/requests', createRequestRoutes(service));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
