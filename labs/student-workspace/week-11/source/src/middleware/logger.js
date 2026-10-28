import { randomUUID } from 'node:crypto';

/** ใส่ X-Request-Id ให้ทุก request และ log หนึ่งบรรทัดเมื่อตอบเสร็จ */
export function logger(req, res, next) {
  const requestId = randomUUID().slice(0, 8);
  const start = Date.now();
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
}
