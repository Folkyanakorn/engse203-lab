import { validationFailed, badRequest } from '../errors/AppError.js';

export const REQUEST_TYPES = ['แจ้งซ่อม', 'ขอใช้ห้อง', 'บริการบัญชีผู้ใช้'];
export const PRIORITIES = ['normal', 'urgent'];
export const STATUSES = ['pending', 'in-progress', 'completed'];
export const ID_PATTERN = /^REQ-[A-Z0-9-]+$/;

const readText = (value) => (typeof value === 'string' ? value.trim() : '');

const rules = {
  requesterName: (v) => (readText(v).length < 2 ? 'ต้องมีอย่างน้อย 2 ตัวอักษร' : null),
  requestType: (v) => (REQUEST_TYPES.includes(v) ? null : `ต้องเป็น ${REQUEST_TYPES.join(', ')}`),
  location: (v) => (readText(v) ? null : 'ห้ามว่าง'),
  details: (v) => (readText(v).length < 10 ? 'ต้องมีอย่างน้อย 10 ตัวอักษร' : null),
  priority: (v) => (PRIORITIES.includes(v) ? null : `ต้องเป็น ${PRIORITIES.join(', ')}`),
  status: (v) => (STATUSES.includes(v) ? null : `ต้องเป็น ${STATUSES.join(', ')}`),
};

const clean = (field, value) => (typeof value === 'string' && !['requestType', 'priority', 'status'].includes(field) ? value.trim() : value);

function assertObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw badRequest('ต้องส่งข้อมูลเป็น JSON object');
  }
}

function collect(body, fields, { requireAll }) {
  const details = [];
  const data = {};
  for (const field of fields) {
    if (body[field] === undefined) {
      if (requireAll) details.push({ field, message: 'จำเป็นต้องระบุ' });
      continue;
    }
    const message = rules[field](body[field]);
    if (message) details.push({ field, message });
    else data[field] = clean(field, body[field]);
  }
  if (details.length > 0) throw validationFailed(details);
  return data;
}

const CREATE_FIELDS = ['requesterName', 'requestType', 'location', 'details', 'priority'];

/** POST: ต้องมีครบทุก field (status เริ่มต้นเป็น pending เสมอ ไม่รับจาก client) */
export function parseCreate(body) {
  assertObject(body);
  return collect(body, CREATE_FIELDS, { requireAll: true });
}

/** PUT: แทนที่ข้อมูลทั้งชุด (รวม status) */
export function parseReplace(body) {
  assertObject(body);
  return collect(body, [...CREATE_FIELDS, 'status'], { requireAll: true });
}

/** PATCH: แก้เฉพาะบาง field ต้องมีอย่างน้อย 1 field */
export function parsePatch(body) {
  assertObject(body);
  const data = collect(body, [...CREATE_FIELDS, 'status'], { requireAll: false });
  if (Object.keys(data).length === 0) throw badRequest('ต้องระบุอย่างน้อย 1 field ที่ต้องการแก้ไข');
  return data;
}

/** ตรวจ query string ของ GET /api/requests */
export function parseListQuery(query) {
  const details = [];
  const { status, priority, q } = query;
  if (status !== undefined && !STATUSES.includes(status)) details.push({ field: 'status', message: rules.status(status) });
  if (priority !== undefined && !PRIORITIES.includes(priority)) details.push({ field: 'priority', message: rules.priority(priority) });

  const limit = query.limit === undefined ? 50 : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) details.push({ field: 'limit', message: 'ต้องเป็นจำนวนเต็ม 1-100' });
  if (!Number.isInteger(offset) || offset < 0) details.push({ field: 'offset', message: 'ต้องเป็นจำนวนเต็มตั้งแต่ 0' });
  if (details.length > 0) throw validationFailed(details);

  return { status, priority, q: typeof q === 'string' ? q.trim().toLowerCase() : undefined, limit, offset };
}
