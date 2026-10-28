import { Router } from 'express';
import { createRequestController } from '../controllers/requestController.js';
import { requireJson } from '../middleware/requireJson.js';
import { validateId } from '../middleware/validateId.js';

export function createRequestRoutes(service) {
  const controller = createRequestController(service);
  const router = Router();

  router.param('id', validateId);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', requireJson, controller.create);
  router.put('/:id', requireJson, controller.replace);
  router.patch('/:id', requireJson, controller.patch);
  router.delete('/:id', controller.remove);

  return router;
}
