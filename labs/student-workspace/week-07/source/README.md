# week-07 — RESTful API, Validation & Error Handling

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ งานนี้สร้างตามหัวข้อ "CRUD, status code, validation, error response" เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

ต่อยอดจาก week-06: ออกแบบ endpoint แบบ RESTful ให้ครบ CRUD เลือก status code ให้ถูกความหมาย ตรวจข้อมูลทุกจุด และตอบ error ในรูปแบบเดียวกันทั้งระบบ

## วิธีรัน

```bash
npm install
npm run dev
npm test
```

## Endpoint และ status code

| Method | Path | ความหมาย | สำเร็จ | ผิดพลาด |
|---|---|---|---|---|
| GET | `/api/requests` | รายการ + filter `status`, `priority`, `q`, `limit`, `offset` (header `X-Total-Count`) | 200 | 422 |
| GET | `/api/requests/:id` | รายการเดียว | 200 | 400 (id ผิดรูปแบบ), 404 |
| POST | `/api/requests` | สร้าง (header `Location`) | 201 | 400, 415, 422 |
| PUT | `/api/requests/:id` | แทนที่ทั้งชุด (ต้องครบทุก field รวม `status`) | 200 | 400, 404, 415, 422 |
| PATCH | `/api/requests/:id` | แก้บาง field | 200 | 400, 404, 415, 422 |
| DELETE | `/api/requests/:id` | ลบ | 204 | 404 |

ข้อตกลง: 400 = request อ่านไม่ได้/รูปแบบผิด, 422 = อ่านได้แต่ค่าไม่ผ่านกติกา, 415 = ไม่ใช่ JSON, 413 = body ใหญ่เกิน 10kb

## รูปแบบ error เดียวกันทั้งระบบ

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "ข้อมูลไม่ผ่านการตรวจสอบ",
             "details": [ { "field": "details", "message": "ต้องมีอย่างน้อย 10 ตัวอักษร" } ] } }
```

error ภายในระบบ (500) จะไม่เปิดเผยรายละเอียด stack ให้ผู้เรียก

## การตัดสินใจ

- validator แยกเป็นโมดูล คืนค่า "ข้อมูลที่ทำความสะอาดแล้ว" (trim, ตัด field ที่ไม่รู้จัก) แทนที่จะส่ง `req.body` ดิบเข้า service
- `status` และ `id` ไม่รับจาก client ตอน POST และแก้ `id` ไม่ได้
- error ทั้งหมดโยนเป็น `AppError` ให้ `errorHandler` ตัวเดียวจัดรูปแบบ

## การทดสอบ

`npm test` (vitest + supertest 19 ข้อ) ผลสรุปอยู่ใน `evidence/API_TEST.md` ควรทดสอบด้วย Postman/Thunder Client เพิ่มเอง
