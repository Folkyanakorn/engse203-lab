import express from 'express';
import requestRoutes from './routes/requestRoutes.js';
import { logger } from './middleware/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  
  app.use(logger);
  app.use(express.json());

  app.get('/', (req, res) => {
  res.json({ message: 'Campus Service API is running', version: '1.0.0' });
  });

  app.use('/api/requests', requestRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
