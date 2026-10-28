const toPositiveInt = (value, fallback, name) => {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${name} ต้องเป็นจำนวนเต็มบวก: ${value}`);
  return number;
};

/**
 * อ่านและตรวจค่าตั้งค่าจาก environment variable เพียงจุดเดียว
 * ถ้าค่าอันตรายในโหมด production จะ "ไม่ยอมเริ่มทำงาน" (fail fast) แทนที่จะเปิดช่องโหว่เงียบ ๆ
 */
export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  const origins = (env.CORS_ORIGIN ?? (isProduction ? '' : 'http://localhost:5173,http://127.0.0.1:5173'))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT ไม่ถูกต้อง: ${env.PORT}`);
  }

  const allowDemoReset = env.ALLOW_DEMO_RESET === 'true';
  if (isProduction && allowDemoReset) {
    throw new Error('ห้ามเปิด ALLOW_DEMO_RESET ใน production (ใครก็ล้างข้อมูลได้)');
  }
  if (origins.includes('*')) {
    throw new Error("CORS_ORIGIN ห้ามเป็น '*' ให้ระบุ origin ที่อนุญาตให้ชัดเจน");
  }

  return {
    port,
    nodeEnv,
    isProduction,
    corsOrigins: origins,
    allowDemoReset,
    dbFile: env.DB_FILE ?? 'data/campus.db',
    trustProxy: env.TRUST_PROXY === undefined ? false : Number.isNaN(Number(env.TRUST_PROXY)) ? env.TRUST_PROXY : Number(env.TRUST_PROXY),
    rateLimit: {
      windowMs: toPositiveInt(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, 'RATE_LIMIT_WINDOW_MS'),
      max: toPositiveInt(env.RATE_LIMIT_MAX, 300, 'RATE_LIMIT_MAX'),
      writeMax: toPositiveInt(env.RATE_LIMIT_WRITE_MAX, 60, 'RATE_LIMIT_WRITE_MAX'),
    },
  };
}
