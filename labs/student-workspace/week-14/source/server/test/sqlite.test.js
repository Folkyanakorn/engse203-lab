import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createSqliteRequestService } from '../src/services/sqliteRequestService.js';

const input = {
  requesterName: 'ญาณากร',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'โปรเจกเตอร์เปิดไม่ติด',
  priority: 'normal',
};

const opened = [];
const open = (filename) => {
  const service = createSqliteRequestService({ filename });
  opened.push(service);
  return service;
};
afterEach(() => {
  while (opened.length) {
    try { opened.pop().close(); } catch { /* ปิดไปแล้ว */ }
  }
});

describe('SQLite persistence', () => {
  it('ข้อมูลอยู่ต่อหลังปิดและเปิดฐานข้อมูลใหม่', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'campus-'));
    const file = join(dir, 'test.db');
    try {
      const first = open(file);
      const created = await first.create(input);
      first.close();

      const second = open(file);
      expect(await second.get(created.id)).toMatchObject({ requesterName: 'ญาณากร' });
      expect((await second.list()).total).toBe(4); // seed 3 + 1
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('seed เฉพาะตอนตารางว่าง ไม่ seed ซ้ำ', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'campus-'));
    const file = join(dir, 'test.db');
    try {
      open(file).close();
      expect((await open(file).list()).total).toBe(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reset คืนข้อมูลตัวอย่างและลบข้อมูลที่เพิ่มเอง', async () => {
    const service = open(':memory:');
    await service.create(input);
    await service.reset();
    expect((await service.list()).total).toBe(3);
  });
});

describe('SQL safety', () => {
  it('คำค้นที่มีเครื่องหมาย SQL ถูกมองเป็นข้อความธรรมดา ตารางไม่ถูกลบ', async () => {
    const service = open(':memory:');
    const app = createApp({ service, enableLogger: false });
    const res = await request(app).get("/api/requests").query({ q: "'; DROP TABLE requests; --" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect((await service.list()).total).toBe(3);
  });

  it('% และ _ ใน q ไม่ทำงานเป็น wildcard', async () => {
    const service = open(':memory:');
    expect((await service.list({ q: '%' })).total).toBe(0);
    expect((await service.list({ q: '_' })).total).toBe(0);
  });

  it('CHECK constraint ของฐานข้อมูลปฏิเสธข้อมูลผิดแม้ข้าม validator', async () => {
    const service = open(':memory:');
    await expect(service.create({ ...input, priority: 'extreme' })).rejects.toThrow(/CHECK/i);
    expect((await service.list()).total).toBe(3);
  });

  it('update ไม่รับชื่อคอลัมน์ที่ไม่อยู่ใน whitelist', async () => {
    const service = open(':memory:');
    const updated = await service.update('REQ-001', { status: 'completed', 'id = id; --': 'x', id: 'REQ-HACK' });
    expect(updated.id).toBe('REQ-001');
    expect(updated.status).toBe('completed');
  });
});

describe('stats (GROUP BY)', () => {
  it('GET /api/requests/stats', async () => {
    const app = createApp({ service: open(':memory:'), enableLogger: false });
    const res = await request(app).get('/api/requests/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 3,
      byStatus: { pending: 1, 'in-progress': 1, completed: 1 },
      byPriority: { urgent: 1, normal: 2 },
    });
  });
});
