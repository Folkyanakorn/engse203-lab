export const REQUEST_TYPES = ['แจ้งซ่อม', 'ขอใช้ห้อง', 'บริการบัญชีผู้ใช้'];
export const PRIORITIES = ['normal', 'urgent'];

const readText = (value) => (typeof value === 'string' ? value.trim() : '');

/** ตรวจ body ของ POST /api/requests แล้วส่งต่อเฉพาะ field ที่ทำความสะอาดแล้ว */
export function validateRequest(req, res, next) {
  const input = req.body;
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return res.status(400).json({ error: 'ต้องส่งข้อมูลคำร้องเป็น JSON object' });
  }

  const details = [];
  if (readText(input.requesterName).length < 2) details.push('requesterName ต้องมีอย่างน้อย 2 ตัวอักษร');
  if (!REQUEST_TYPES.includes(input.requestType)) details.push(`requestType ต้องเป็น ${REQUEST_TYPES.join(', ')}`);
  if (!readText(input.location)) details.push('location ห้ามว่าง');
  if (readText(input.details).length < 10) details.push('details ต้องมีอย่างน้อย 10 ตัวอักษร');
  if (!PRIORITIES.includes(input.priority)) details.push(`priority ต้องเป็น ${PRIORITIES.join(', ')}`);

  if (details.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลคำร้องไม่ถูกต้อง', details });
  }

  req.body = {
    requesterName: readText(input.requesterName),
    requestType: input.requestType,
    location: readText(input.location),
    details: readText(input.details),
    priority: input.priority,
  };
  next();
}
