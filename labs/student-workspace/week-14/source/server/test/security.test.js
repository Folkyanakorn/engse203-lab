import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createSqliteRequestService } from '../src/services/sqliteRequestService.js';

const open = [];
const dirs = [];
afterEach(() => {
  open.splice(0).forEach((s) => s.close());
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true }));
});

const makeApp = (options = {}) => {
  const service = createSqliteRequestService();
  open.push(service);
  return createApp({ service, enableLogger: false, corsOrigins: ['http://localhost:5173'], ...options });
};

const valid = { requesterName: 'ญาณากร', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', details: 'โปรเจกเตอร์เปิดไม่ติด', priority: 'normal' };

describe('security headers (helmet)', () => {
  it('ตอบ header ป้องกันพื้นฐานครบ', async () => {
    const res = await request(makeApp()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
    expect(res.headers['content-security-policy']).toMatch(/default-src 'self'/);
    expect(res.headers['content-security-policy']).toMatch(/script-src 'self'/);
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('error response ก็มี header เหล่านี้ (404/422)', async () => {
    const app = makeApp();
    expect((await request(app).get('/api/nope')).headers['x-content-type-options']).toBe('nosniff');
    expect((await request(app).post('/api/requests').send({})).headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('rate limiting', () => {
  it('เกินโควตา -> 429 รูปแบบ error เดียวกับระบบ และมี header RateLimit', async () => {
    const app = makeApp({ rateLimit: { max: 3, writeMax: 100 } });
    for (let i = 0; i < 3; i += 1) expect((await request(app).get('/api/requests')).status).toBe(200);
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
    expect(res.headers['ratelimit']).toBeDefined();
  });

  it('/api/health ไม่ถูกจำกัด เพื่อให้ระบบ monitor ตรวจได้เสมอ', async () => {
    const app = makeApp({ rateLimit: { max: 1, writeMax: 1 } });
    for (let i = 0; i < 5; i += 1) expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('การเขียนมีโควตาเข้มกว่า แต่การอ่านยังใช้ได้', async () => {
    const app = makeApp({ rateLimit: { max: 100, writeMax: 2 } });
    expect((await request(app).post('/api/requests').send(valid)).status).toBe(201);
    expect((await request(app).post('/api/requests').send(valid)).status).toBe(201);
    const blocked = await request(app).post('/api/requests').send(valid);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('WRITE_RATE_LIMITED');
    expect((await request(app).get('/api/requests')).status).toBe(200);
  });

  it('ไม่นับ static files ของ client ในโควตา /api', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'client-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'index.html'), '<h1>client</h1>');
    const app = makeApp({ staticDir: dir, rateLimit: { max: 1, writeMax: 1 } });
    for (let i = 0; i < 5; i += 1) expect((await request(app).get('/index.html')).status).toBe(200);
  });
});

describe('input hardening', () => {
  it('ข้อมูลที่เป็น HTML/SQL ถูกเก็บเป็นข้อความธรรมดาและส่งคืนโดยไม่ตีความ', async () => {
    const app = makeApp();
    const evil = { ...valid, details: "<script>alert(1)</script>'; DROP TABLE requests;--" };
    const created = await request(app).post('/api/requests').send(evil);
    expect(created.status).toBe(201);
    expect(created.headers['content-type']).toMatch(/application\/json/);
    expect((await request(app).get(`/api/requests/${created.body.id}`)).body.details).toBe(evil.details);
    expect((await request(app).get('/api/requests')).headers['x-total-count']).toBe('4');
  });

  it('prototype pollution ใน JSON ไม่มีผล', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/requests').set('Content-Type', 'application/json')
      .send('{"__proto__":{"polluted":true},"requesterName":"ญาณากร","requestType":"แจ้งซ่อม","location":"x","details":"รายละเอียดยาวพอ","priority":"normal"}');
    expect(res.status).toBe(201);
    expect({}.polluted).toBeUndefined();
    expect(res.body.polluted).toBeUndefined();
  });

  it('error 500 ไม่รั่วข้อความภายใน', async () => {
    const broken = { ...createSqliteRequestService(), list: async () => { throw new Error('SQLITE_CORRUPT: /var/db/secret.db'); } };
    const app = createApp({ service: broken, enableLogger: false });
    const original = console.error;
    console.error = () => {};
    const res = await request(app).get('/api/requests');
    console.error = original;
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/SQLITE|secret|\/var/);
  });
});

describe('config guards', () => {
  it('production + ALLOW_DEMO_RESET=true -> ไม่ยอมเริ่ม', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', ALLOW_DEMO_RESET: 'true', CORS_ORIGIN: 'https://a.test' })).toThrow(/ALLOW_DEMO_RESET/);
  });

  it("CORS_ORIGIN='*' -> ไม่ยอมเริ่ม", () => {
    expect(() => loadConfig({ CORS_ORIGIN: '*' })).toThrow(/ห้ามเป็น/);
  });

  it('production ไม่มี CORS_ORIGIN -> ไม่อนุญาต origin ใด ๆ (ไม่ fallback เป็น localhost)', () => {
    expect(loadConfig({ NODE_ENV: 'production' }).corsOrigins).toEqual([]);
  });

  it('ค่า rate limit ผิด -> throw, ค่าที่ถูกต้องถูกอ่าน', () => {
    expect(() => loadConfig({ RATE_LIMIT_MAX: '0' })).toThrow(/RATE_LIMIT_MAX/);
    expect(loadConfig({ RATE_LIMIT_MAX: '10', TRUST_PROXY: '1' })).toMatchObject({ rateLimit: { max: 10 }, trustProxy: 1 });
  });
});
