import { AppError } from '../errors/AppError.js';

/** รูปแบบ error ที่ทุก endpoint ใช้ร่วมกัน: { error: { code, message, details? } } */
function body(code, message, details) {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

export function notFound(req, res) {
  res.status(404).json(body('ROUTE_NOT_FOUND', `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json(body(err.code, err.message, err.details));
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(body('INVALID_JSON', 'JSON ที่ส่งมาไม่ถูกต้อง'));
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json(body('PAYLOAD_TOO_LARGE', 'ข้อมูลที่ส่งมามีขนาดใหญ่เกินไป'));
  }
  console.error('เกิดข้อผิดพลาด:', err.message);
  res.status(500).json(body('INTERNAL_ERROR', 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'));
}
