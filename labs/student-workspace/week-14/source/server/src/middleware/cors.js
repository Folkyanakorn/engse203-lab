import cors from 'cors';

/**
 * อนุญาตเฉพาะ origin ที่อยู่ในรายการ (CORS_ORIGIN) ไม่ใช้ '*'
 * request ที่ไม่มี Origin (curl, Postman, server-to-server) ผ่านได้ เพราะ CORS เป็นกติกาของเบราว์เซอร์
 */
export function createCors(allowedOrigins) {
  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['X-Total-Count', 'Location', 'X-Request-Id'],
    maxAge: 600,
  });
}
