export function notFound(req, res) {
  res.status(404).json({ error: `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // JSON ที่ส่งมาผิดรูปแบบ
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON ที่ส่งมาไม่ถูกต้อง' });
  }
  console.error('เกิดข้อผิดพลาด:', err.message);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
}
