# week-14 — Quality, Security & Delivery Readiness

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ (โฟลเดอร์ week-14 ตรงกับ LAB 13) งานนี้สร้างตามหัวข้อ "Quality, Security & Delivery Readiness" เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

ยกระดับโปรเจกต์ full-stack ของ week-13 ให้พร้อมส่งมอบ: ความปลอดภัย คุณภาพโค้ด และ checklist การส่งงาน

## สิ่งที่เพิ่ม

- `helmet` (CSP, nosniff, frame-ancestors, HSTS), rate limit ต่อ IP (อ่าน/เขียนแยกโควตา, 429 ในรูปแบบ error เดียวกับระบบ)
- `config.js` ที่ **ไม่ยอมเริ่มทำงาน** เมื่อตั้งค่าอันตราย (production + `ALLOW_DEMO_RESET`, CORS `*`)
- ESLint (`npm run lint`) และ `npm audit` (`npm run audit`)
- `docs/SECURITY_CHECKLIST.md` (ความเสี่ยง → มาตรการ → หลักฐาน และสิ่งที่ยังไม่ทำ: ไม่มี authentication)
- `docs/DELIVERY_CHECKLIST.md` ก่อนส่งและทดลอง production ในเครื่อง

## วิธีรัน

```bash
npm run install:all
npm run verify        # lint + test + build + audit
npm start             # production-like ที่ http://localhost:3000
```

## ผลที่ตรวจแล้ว (ในเครื่องผู้สร้างงาน)

| รายการ | ผล |
|---|---|
| server test | 97 ข้อผ่าน (รวม security 13 ข้อ) |
| client test | 31 ข้อผ่าน (จาก week-13) |
| ESLint (server) | ไม่มี error |
| `npm audit --omit=dev` (server, client) | 0 ช่องโหว่ |
| e2e (Playwright) ภายใต้ CSP | 14 ข้อผ่าน ไม่มี CSP violation |

ผล audit เปลี่ยนตามเวลา ต้องรันซ้ำก่อนส่ง

## ที่ต้องทำเอง

- ทำรายการ "ตรวจด้วยตัวเอง" ท้าย `SECURITY_CHECKLIST.md` และ `DELIVERY_CHECKLIST.md` แล้วแนบหลักฐาน
- เขียนอธิบายว่า rate limit, CSP และ config guard แต่ละอย่างป้องกันอะไร
