import { describe, expect, it, vi, afterEach } from 'vitest';
import { Request, toApi } from '../src/models/Request.js';
import { createMongoRequestService } from '../src/services/mongoRequestService.js';

const valid = {
  publicId: 'REQ-ABC-123',
  requesterName: 'ญาณากร',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'โปรเจกเตอร์เปิดไม่ติด',
  priority: 'normal',
};

afterEach(() => vi.restoreAllMocks());

describe('Request schema (ไม่ต้องใช้ฐานข้อมูล)', () => {
  it('ข้อมูลถูกต้องผ่าน และ status เริ่มต้นเป็น pending', () => {
    const doc = new Request(valid);
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.status).toBe('pending');
  });

  it('trim ข้อความก่อนบันทึก', () => {
    expect(new Request({ ...valid, requesterName: '  ญาณากร  ' }).requesterName).toBe('ญาณากร');
  });

  it.each([
    ['requesterName', 'x'],
    ['requestType', 'อื่น ๆ'],
    ['details', 'สั้นไป'],
    ['priority', 'extreme'],
    ['status', 'done'],
    ['publicId', 'abc'],
  ])('ปฏิเสธ %s ที่ผิดกติกา', (field, value) => {
    const error = new Request({ ...valid, [field]: value }).validateSync();
    expect(error?.errors[field]).toBeDefined();
  });

  it('toApi ไม่ส่ง _id / timestamps ออกไป', () => {
    const api = toApi(new Request(valid));
    expect(Object.keys(api).sort()).toEqual(['details', 'id', 'location', 'priority', 'requestType', 'requesterName', 'status']);
    expect(api.id).toBe('REQ-ABC-123');
  });
});

describe('service สร้าง query อย่างปลอดภัย (mock model)', () => {
  function mockFind() {
    const chain = { sort: vi.fn(() => chain), skip: vi.fn(() => chain), limit: vi.fn(() => chain), lean: vi.fn(async () => []) };
    const find = vi.spyOn(Request, 'find').mockReturnValue(chain);
    const count = vi.spyOn(Request, 'countDocuments').mockResolvedValue(0);
    return { find, count, chain };
  }

  it('q ถูก escape เป็น regex ธรรมดา', async () => {
    const { find } = mockFind();
    await createMongoRequestService().list({ q: '.*(a+)+$' });
    const filter = find.mock.calls[0][0];
    const pattern = filter.$or[0].requesterName;
    expect(pattern.source).toBe('\\.\\*\\(a\\+\\)\\+\\$');
    expect(pattern.test('abc')).toBe(false);
  });

  it('status/priority ถูกแปลงเป็น string ไม่ให้ object (เช่น {$ne:null}) หลุดเข้า query', async () => {
    const { find } = mockFind();
    await createMongoRequestService().list({ status: { $ne: null }, priority: 'urgent' });
    const filter = find.mock.calls[0][0];
    expect(typeof filter.status).toBe('string');
    expect(filter.priority).toBe('urgent');
  });

  it('แบ่งหน้าด้วย skip/limit และ count ใช้ filter เดียวกัน', async () => {
    const { chain, count, find } = mockFind();
    await createMongoRequestService().list({ status: 'pending', limit: 5, offset: 10 });
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(count).toHaveBeenCalledWith(find.mock.calls[0][0]);
  });

  it('get ใช้ publicId เป็น string เสมอ', async () => {
    const findOne = vi.spyOn(Request, 'findOne').mockReturnValue({ lean: async () => null });
    expect(await createMongoRequestService().get({ $gt: '' })).toBeNull();
    expect(typeof findOne.mock.calls[0][0].publicId).toBe('string');
  });

  it('remove คืน false เมื่อไม่มีเอกสารถูกลบ', async () => {
    vi.spyOn(Request, 'deleteOne').mockResolvedValue({ deletedCount: 0 });
    expect(await createMongoRequestService().remove('REQ-X')).toBe(false);
  });
});
