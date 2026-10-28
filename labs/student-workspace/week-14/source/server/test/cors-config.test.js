import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createMemoryRequestService } from '../src/services/memoryRequestService.js';

const ALLOWED = 'http://localhost:5173';
const makeApp = async () =>
  createApp({ service: await createMemoryRequestService(), corsOrigins: [ALLOWED], enableLogger: false });

describe('CORS', () => {
  it('origin ที่อนุญาตได้ Access-Control-Allow-Origin และ expose header ที่ client ต้องอ่าน', async () => {
    const res = await request(await makeApp()).get('/api/requests').set('Origin', ALLOWED);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED);
    expect(res.headers['access-control-expose-headers']).toMatch(/X-Total-Count/);
  });

  it('origin ที่ไม่อยู่ในรายการไม่ได้ header (เบราว์เซอร์จะบล็อก)', async () => {
    const res = await request(await makeApp()).get('/api/requests').set('Origin', 'http://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('preflight ของ PATCH + Content-Type ผ่านสำหรับ origin ที่อนุญาต', async () => {
    const res = await request(await makeApp())
      .options('/api/requests/REQ-001')
      .set('Origin', ALLOWED)
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-methods']).toMatch(/PATCH/);
    expect(res.headers['access-control-allow-headers']).toMatch(/Content-Type/i);
  });

  it('ไม่มี Origin (curl/Postman) ยังเรียกใช้ได้', async () => {
    expect((await request(await makeApp()).get('/api/requests')).status).toBe(200);
  });
});

describe('infrastructure', () => {
  it('GET /api/health -> ok และมี X-Request-Id', async () => {
    const res = await request(await createApp({ service: await createMemoryRequestService(), enableLogger: true })).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{8}$/);
  });

  it('ไม่เปิดเผย X-Powered-By', async () => {
    const res = await request(await makeApp()).get('/api');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('loadConfig', () => {
  it('ใช้ค่าเริ่มต้นเมื่อไม่ตั้ง env', () => {
    const config = loadConfig({});
    expect(config.port).toBe(3000);
    expect(config.corsOrigins).toContain('http://localhost:5173');
  });

  it('แยก CORS_ORIGIN หลายค่าและตัดช่องว่าง', () => {
    expect(loadConfig({ CORS_ORIGIN: 'http://a.test, http://b.test ' }).corsOrigins).toEqual(['http://a.test', 'http://b.test']);
  });

  it('PORT ผิด -> throw', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT/);
  });
});
