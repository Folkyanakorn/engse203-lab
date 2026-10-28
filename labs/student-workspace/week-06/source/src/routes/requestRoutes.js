import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { createRequestController } from '../controllers/requestController.js';

export function createRequestRoutes(service) {
  const controller = createRequestController(service);
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validateRequest, controller.create);
  router.put('/:id', controller.updateStatus);
  router.delete('/:id', controller.remove);

  return router;
}
