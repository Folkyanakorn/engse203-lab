import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createSqliteRequestService } from '../src/services/sqliteRequestService.js';

const services = [];
const dirs = [];
afterEach(() => {
  services.splice(0).forEach((s) => s.close());
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true }));
});

const makeApp = (options = {}) => {
  const service = createSqliteRequestService();
  services.push(service);
  return createApp({ service, enableLogger: false, ...options });
};

describe('demo reset', () => {
  it('ปิดเป็นค่าเริ่มต้น -> 403', async () => {
    const res = await request(makeApp()).post('/api/demo/reset');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('เปิดแล้วคืนข้อมูลตัวอย่าง', async () => {
    const app = makeApp({ allowDemoReset: true });
    await request(app).delete('/api/requests/REQ-001');
    const res = await request(app).post('/api/demo/reset');
    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(3);
  });
});

describe('static client', () => {
  it('เสิร์ฟไฟล์จาก staticDir ที่ origin เดียวกับ API', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'client-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'index.html'), '<h1>client</h1>');
    const app = makeApp({ staticDir: dir });
    expect((await request(app).get('/index.html')).text).toContain('client');
    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('ไม่มี staticDir ก็ยังทำงานเป็น API ปกติ', async () => {
    expect((await request(makeApp({ staticDir: '/ไม่มีจริง' })).get('/api/requests')).status).toBe(200);
  });
});
