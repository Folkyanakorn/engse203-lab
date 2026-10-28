# week-08 — API Contract, CORS & Front-end Integration

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ งานนี้สร้างตามหัวข้อ "API contract, CORS/config/logging และเชื่อม front-end" เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

## สิ่งที่เพิ่มจาก week-07

- `docs/API_CONTRACT.md` สัญญา API ที่ front-end และ back-end ยึดร่วมกัน
- CORS แบบ allow-list จาก `CORS_ORIGIN` + `src/config.js` + `.env.example`
- logging พร้อม `X-Request-Id`, `GET /api/health`, ปิด `X-Powered-By`
- `client/` front-end (vanilla JS) เรียก API จริง มี loading / empty / error และแสดง validation error รายช่อง

## วิธีรัน

```bash
npm install
cp .env.example .env     # (ไม่บังคับ)
npm run dev              # API  http://localhost:3000
npm run client           # หน้าเว็บ http://localhost:5173   (เปิดอีก terminal)
npm test
```

เปิด `http://localhost:5173` ได้เลย หากเปลี่ยนพอร์ตของ client ต้องแก้ `CORS_ORIGIN` ให้ตรง และเปลี่ยน API ได้ด้วย `?api=http://localhost:3000`

## ทดสอบ CORS ด้วยตัวเอง

1. รัน API แต่ตั้ง `CORS_ORIGIN=http://localhost:9999` แล้วเปิดหน้าเว็บ ต้องเห็นข้อความเชื่อมต่อ API ไม่ได้ และ Console ขึ้น CORS error
2. ตั้งกลับให้ตรง ข้อมูลต้องแสดง

## การตัดสินใจ

- ไม่ใช้ `Access-Control-Allow-Origin: *` เพื่อจำกัดว่าใครเรียก API จากเบราว์เซอร์ได้
- ค่าตั้งค่าอยู่ใน env เพียงจุดเดียว (`config.js`) ไม่ฝังในโค้ด
- client ใช้ `textContent` เสมอ ไม่ใช้ `innerHTML` กับข้อมูลจาก API

## หลักฐาน

ดู `evidence/API_TEST.md` และต้องถ่าย screenshot หน้าเว็บ (ปกติ / error CORS / validation error) เอง
