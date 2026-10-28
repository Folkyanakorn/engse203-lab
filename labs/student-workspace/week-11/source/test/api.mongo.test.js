import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe as baseDescribe, expect, it } from 'vitest';

// ชุดทดสอบนี้ต้องใช้ MongoDB จริง: ตั้ง MONGODB_URI_TEST=mongodb://127.0.0.1:27017/campus_test แล้วรัน npm test
const describe = process.env.MONGODB_URI_TEST ? baseDescribe : baseDescribe.skip;
import { createApp } from '../src/app.js';
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../src/db.js';
import { createMongoRequestService } from '../src/services/mongoRequestService.js';

const validBody = {
  requesterName: 'ญาณากร',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'โปรเจกเตอร์เปิดไม่ติด',
  priority: 'normal',
};

const MONGO_URI = process.env.MONGODB_URI_TEST;
const service = createMongoRequestService();
let app;
beforeAll(async () => { if (MONGO_URI) await connectDb(MONGO_URI); });
afterAll(async () => { if (MONGO_URI) { await mongoose.connection.dropDatabase(); await disconnectDb(); } });
beforeEach(async () => {
  await service.reset();
  app = createApp({ service: service, corsOrigins: ['http://localhost:5173'], enableLogger: false });
});

describe('GET /api/requests', () => {
  it('200 พร้อม X-Total-Count', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('3');
  });

  it('กรองด้วย status / priority / q', async () => {
    expect((await request(app).get('/api/requests?status=pending')).body).toHaveLength(1);
    expect((await request(app).get('/api/requests?priority=urgent')).body).toHaveLength(1);
    expect((await request(app).get('/api/requests?q=ห้องประชุม')).body).toHaveLength(1);
  });

  it('แบ่งหน้าด้วย limit/offset แต่ total ยังเป็นจำนวนทั้งหมด', async () => {
    const res = await request(app).get('/api/requests?limit=2&offset=1');
    expect(res.body).toHaveLength(2);
    expect(res.headers['x-total-count']).toBe('3');
  });

  it('query ผิด -> 422 พร้อมรายละเอียดรายช่อง', async () => {
    const res = await request(app).get('/api/requests?status=x&limit=0');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details.map((d) => d.field)).toEqual(['status', 'limit']);
  });
});

describe('GET /api/requests/:id', () => {
  it('200 / 404 / 400 (รูปแบบ id ผิด)', async () => {
    expect((await request(app).get('/api/requests/REQ-001')).status).toBe(200);
    const missing = await request(app).get('/api/requests/REQ-999');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
    expect((await request(app).get('/api/requests/abc')).status).toBe(400);
  });
});

describe('POST /api/requests', () => {
  it('201 + Location + status pending', async () => {
    const res = await request(app).post('/api/requests').send(validBody);
    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/api/requests/${res.body.id}`);
    expect(res.body.status).toBe('pending');
  });

  it('ไม่รับ status จาก client', async () => {
    const res = await request(app).post('/api/requests').send({ ...validBody, status: 'completed' });
    expect(res.body.status).toBe('pending');
  });

  it('trim ข้อความ', async () => {
    const res = await request(app).post('/api/requests').send({ ...validBody, requesterName: '  ญาณากร  ' });
    expect(res.body.requesterName).toBe('ญาณากร');
  });

  it('ข้อมูลไม่ครบ -> 422 ระบุทุก field ที่ผิด', async () => {
    const res = await request(app).post('/api/requests').send({ requesterName: 'x' });
    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveLength(5);
  });

  it('body ไม่ใช่ object -> 400', async () => {
    const res = await request(app).post('/api/requests').send([1, 2]);
    expect(res.status).toBe(400);
  });

  it('JSON เสีย -> 400 INVALID_JSON', async () => {
    const res = await request(app).post('/api/requests').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('Content-Type ไม่ใช่ JSON -> 415', async () => {
    const res = await request(app).post('/api/requests').set('Content-Type', 'text/plain').send('hello');
    expect(res.status).toBe(415);
  });

  it('body ใหญ่เกิน 10kb -> 413', async () => {
    const res = await request(app).post('/api/requests').send({ ...validBody, details: 'x'.repeat(20000) });
    expect(res.status).toBe(413);
  });
});

describe('PUT / PATCH / DELETE', () => {
  it('PUT แทนที่ทั้งชุด ต้องครบทุก field', async () => {
    const ok = await request(app).put('/api/requests/REQ-001').send({ ...validBody, status: 'completed' });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ id: 'REQ-001', status: 'completed', requesterName: 'ญาณากร' });
    const bad = await request(app).put('/api/requests/REQ-001').send({ status: 'completed' });
    expect(bad.status).toBe(422);
  });

  it('PATCH แก้บาง field โดย field อื่นคงเดิม', async () => {
    const res = await request(app).patch('/api/requests/REQ-001').send({ status: 'in-progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in-progress');
    expect(res.body.location).toBe('ห้องปฏิบัติการ 301');
  });

  it('PATCH body ว่าง -> 400, ค่าผิด -> 422, ไม่พบ -> 404', async () => {
    expect((await request(app).patch('/api/requests/REQ-001').send({})).status).toBe(400);
    expect((await request(app).patch('/api/requests/REQ-001').send({ status: 'มั่ว' })).status).toBe(422);
    expect((await request(app).patch('/api/requests/REQ-999').send({ status: 'pending' })).status).toBe(404);
  });

  it('PATCH เปลี่ยน id ไม่ได้', async () => {
    const res = await request(app).patch('/api/requests/REQ-001').send({ id: 'REQ-HACK', status: 'pending' });
    expect(res.body.id).toBe('REQ-001');
  });

  it('DELETE 204 แล้ว 404', async () => {
    expect((await request(app).delete('/api/requests/REQ-003')).status).toBe(204);
    expect((await request(app).delete('/api/requests/REQ-003')).status).toBe(404);
    expect((await request(app).get('/api/requests')).body).toHaveLength(2);
  });
});

describe('อื่น ๆ', () => {
  it('เส้นทางที่ไม่มี -> 404 ROUTE_NOT_FOUND', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
