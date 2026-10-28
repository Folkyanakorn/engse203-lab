import { unsupportedMediaType } from '../errors/AppError.js';

/** POST/PUT/PATCH ที่มี body ต้องเป็น application/json */
export function requireJson(req, res, next) {
  const hasBody = Number(req.headers['content-length'] ?? 0) > 0 || req.headers['transfer-encoding'];
  if (hasBody && !req.is('application/json')) return next(unsupportedMediaType());
  next();
}
