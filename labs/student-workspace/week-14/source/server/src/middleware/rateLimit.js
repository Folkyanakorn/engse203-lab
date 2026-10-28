import { rateLimit } from 'express-rate-limit';

const DEFAULTS = {
  windowMs: 15 * 60 * 1000,
  max: 300, // ทั้งหมดต่อ IP ต่อช่วงเวลา
  writeMax: 60, // เฉพาะ POST/PUT/PATCH/DELETE
};

function limiter({ windowMs, max, code, message }) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7', // ส่ง RateLimit-* ให้ client รู้โควตาที่เหลือ
    legacyHeaders: false,
    // ตอบในรูปแบบ error เดียวกับทั้งระบบ
    handler: (req, res) => res.status(429).json({ error: { code, message } }),
  });
}

export function createRateLimiters(options = {}) {
  const { windowMs, max, writeMax } = { ...DEFAULTS, ...options };
  return {
    general: limiter({ windowMs, max, code: 'RATE_LIMITED', message: 'ส่งคำขอถี่เกินไป กรุณาลองใหม่ภายหลัง' }),
    writes: limiter({ windowMs, max: writeMax, code: 'WRITE_RATE_LIMITED', message: 'บันทึกข้อมูลถี่เกินไป กรุณาลองใหม่ภายหลัง' }),
  };
}
