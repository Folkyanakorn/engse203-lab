import { Router } from 'express';
import * as controller from '../controllers/requestController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', controller.listRequests);
router.get('/:id', controller.getRequest);
router.post('/', validateRequest, controller.createRequest);
router.delete('/:id', controller.deleteRequest);
router.put('/:id', controller.updateRequestStatus);
export default router;