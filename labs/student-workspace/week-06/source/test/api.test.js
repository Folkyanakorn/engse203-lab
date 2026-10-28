import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createMemoryRequestService } from '../src/services/memoryRequestService.js';

const validBody = {
  requesterName: 'ญาณากร',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'โปรเจกเตอร์เปิดไม่ติด',
  priority: 'normal',
};

let app;
beforeEach(async () => {
  app = createApp({ service: await createMemoryRequestService(), enableLogger: false });
});

describe('Campus Service API (week-06)', () => {
  it('GET / -> 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/running/);
  });

  it('GET /api/requests -> 200 รายการ seed', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('GET /api/requests/REQ-001 -> 200', async () => {
    const res = await request(app).get('/api/requests/REQ-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('REQ-001');
  });

  it('GET /api/requests/REQ-999 -> 404', async () => {
    expect((await request(app).get('/api/requests/REQ-999')).status).toBe(404);
  });

  it('POST ข้อมูลถูกต้อง -> 201 และสถานะ pending', async () => {
    const res = await request(app).post('/api/requests').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.id).toMatch(/^REQ-/);
  });

  it('POST ข้อมูลไม่ครบ -> 400 พร้อม details', async () => {
    const res = await request(app).post('/api/requests').send({ requesterName: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('POST JSON เสีย -> 400', async () => {
    const res = await request(app).post('/api/requests').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });

  it('DELETE -> 204 แล้ว GET ซ้ำ -> 404', async () => {
    expect((await request(app).delete('/api/requests/REQ-003')).status).toBe(204);
    expect((await request(app).get('/api/requests/REQ-003')).status).toBe(404);
  });

  it('DELETE ที่ไม่มี -> 404', async () => {
    expect((await request(app).delete('/api/requests/REQ-999')).status).toBe(404);
  });

  it('GET ?status=pending กรองรายการ', async () => {
    const res = await request(app).get('/api/requests?status=pending');
    expect(res.status).toBe(200);
    expect(res.body.every((item) => item.status === 'pending')).toBe(true);
  });

  it('PUT เปลี่ยนสถานะ -> 200 / สถานะผิด -> 400', async () => {
    const ok = await request(app).put('/api/requests/REQ-001').send({ status: 'in-progress' });
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('in-progress');
    const bad = await request(app).put('/api/requests/REQ-001').send({ status: 'มั่ว' });
    expect(bad.status).toBe(400);
  });

  it('เส้นทางที่ไม่มี -> 404', async () => {
    expect((await request(app).get('/api/unknown')).status).toBe(404);
  });
});
