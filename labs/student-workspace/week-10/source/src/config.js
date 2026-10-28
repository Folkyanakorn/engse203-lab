/** อ่านค่าตั้งค่าจาก environment variable เพียงจุดเดียว */
export function loadConfig(env = process.env) {
  const origins = (env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT ไม่ถูกต้อง: ${env.PORT}`);
  }

  return {
    port,
    nodeEnv: env.NODE_ENV ?? 'development',
    corsOrigins: origins,
    dbFile: env.DB_FILE ?? 'data/campus.db',
  };
}
