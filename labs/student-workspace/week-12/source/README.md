# week-12 — Individual Full-Stack Integration

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ (โฟลเดอร์ week-12 ตรงกับ LAB 11) งานนี้สร้างตามหัวข้อ "Individual Full-Stack Integration" เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

รวม front-end React (จาก week-05) เข้ากับ back-end Express + SQLite (จาก week-07 ถึง 10) เป็นแอปเดียว ข้อมูลอยู่ในฐานข้อมูลจริง

## โครงสร้าง

```text
source/
├── client/   React + Vite (service layer เรียก REST API)
├── server/   Express + SQLite (เสิร์ฟ client/dist ตอน production)
├── e2e/      smoke test ด้วย Playwright (ไม่บังคับ)
└── docs/ARCHITECTURE.md
```

## วิธีรัน

ต้องใช้ Node.js >= 22.13

```bash
npm run install:all

# โหมดพัฒนา (เปิด 2 terminal)
cp server/.env.example server/.env
npm run dev:server        # http://localhost:3000  (API)
npm run dev:client        # http://localhost:5173  (หน้าเว็บ, proxy /api ไป 3000)

# โหมด production (origin เดียว)
npm start                 # build client แล้วเปิด http://localhost:3000
npm test                  # server 59 ข้อ
```

## สิ่งที่ปรับจาก week-05

- `requestService.js` เปลี่ยนจาก localStorage เป็น `fetch` ไป REST API และแปลง error ของ API เป็นข้อความที่ผู้ใช้อ่านได้
- ลบ `requestStorage.js` (ข้อมูลไม่อยู่ในเบราว์เซอร์แล้ว)
- เพิ่ม `POST /api/demo/reset` (ปิดเป็นค่าเริ่มต้น) ให้ปุ่ม Reset Demo Data ทำงาน

## ผลการตรวจที่ทำแล้ว (ในเครื่องผู้สร้างงาน)

- `npm test` ฝั่ง server ผ่าน 59 ข้อ และ client `vite build` ผ่าน
- ทดสอบด้วยเบราว์เซอร์อัตโนมัติ (Playwright, `e2e/smoke.mjs`) 14 ข้อผ่าน: เพิ่ม/ลบ/refresh แล้วข้อมูลยังอยู่, validation, หน้าไม่พบ, สถานะ error/empty, ไม่มี horizontal scroll ที่ 375px

ต้องทดสอบด้วยตาตัวเองในเบราว์เซอร์ของคุณเพิ่ม และแนบ screenshot ใน `evidence/`
