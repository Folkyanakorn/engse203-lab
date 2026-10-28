# week-06 — Node.js / Express API Foundation

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ งานนี้สร้างตามหัวข้อ "Express API Foundation" เมื่ออาจารย์ประกาศโจทย์จริง ให้ตรวจเทียบ requirement แล้วปรับให้ตรง

## ภาพรวม

REST API สำหรับระบบ Campus Service Request (ต่อยอดจากหน้าเว็บ week 3 ถึง 5) ใช้ Express 5 แบ่งชั้นเป็น routes → controllers → services

## วิธีรัน

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest + supertest
npm run check
```

## Endpoint

| Method | Path | ความหมาย | Status |
|---|---|---|---|
| GET | `/` | ตรวจว่า API ทำงาน | 200 |
| GET | `/api/requests` | รายการ (กรองด้วย `?status=`) | 200 / 400 |
| GET | `/api/requests/:id` | รายการเดียว | 200 / 404 |
| POST | `/api/requests` | สร้างคำร้อง (สถานะเริ่มต้น `pending`) | 201 / 400 |
| PUT | `/api/requests/:id` | เปลี่ยนสถานะ `{ "status": "..." }` | 200 / 400 / 404 |
| DELETE | `/api/requests/:id` | ลบ | 204 / 404 |

## โครงสร้าง

```text
src/
├── app.js            ประกอบ middleware + routes (รับ service เข้ามา: dependency injection)
├── server.js         เริ่มเซิร์ฟเวอร์ + เลือก service
├── routes/           map URL → controller
├── controllers/      ตัดสิน status code
├── middleware/       logger, validateRequest, errorHandler
└── services/         เก็บข้อมูล (memory + ไฟล์ JSON)
```

เหตุผลที่ส่ง `service` เข้า `createApp()`: ให้สลับที่เก็บข้อมูลเป็นฐานข้อมูลในสัปดาห์หลังได้โดยไม่แก้ controller และให้ test ใช้ข้อมูลของตัวเอง

## การทดสอบ

ดู `evidence/API_TEST.md` (ผลรัน automated test จริง) และให้ทดสอบด้วย Postman/Thunder Client เองเพิ่มเติม

## การใช้ AI

ดู `AI_USAGE.md`
