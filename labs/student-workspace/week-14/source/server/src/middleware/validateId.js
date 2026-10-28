import { badRequest } from '../errors/AppError.js';
import { ID_PATTERN } from '../validators/requestValidator.js';

export function validateId(req, res, next, id) {
  if (!ID_PATTERN.test(id)) return next(badRequest(`รูปแบบรหัสคำร้องไม่ถูกต้อง: ${id}`));
  next();
}
