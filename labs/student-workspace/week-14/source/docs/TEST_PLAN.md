# Test Plan — week-13

## ระดับของการทดสอบ

| ระดับ | เครื่องมือ | ที่อยู่ | ตัวอย่างสิ่งที่ตรวจ |
|---|---|---|---|
| Unit (server) | vitest | `server/test/validator.test.js` | validator, AppError, errorHandler, validateId — รวมค่าขอบเขตและชนิดข้อมูลผิด |
| Integration (server) | vitest + supertest | `api.memory/api.sqlite/sqlite/cors-config/fullstack.test.js` | route → controller → service → DB จริง (SQLite in-memory/ไฟล์ชั่วคราว) |
| Unit (client service) | vitest + mock fetch | `client/src/services/requestService.test.js` | การแปลง error, 404 → null, encode URL |
| Component (client) | Testing Library | `RequestForm.test.jsx`, `RequestList.test.jsx` | validation, aria-invalid, ปุ่มกดซ้ำ, XSS แสดงเป็นข้อความ |
| Page (client) | Testing Library + mock service | `DashboardPage.test.jsx` | loading/empty/error/retry, filter, delete, stale guard |
| E2E | Playwright (ไม่บังคับ) | `e2e/smoke.mjs` | ใช้งานจริงทั้งระบบผ่านเบราว์เซอร์ |
| Manual | ตัวผู้เรียน | Postman + เบราว์เซอร์ | ตาม checklist ด้านล่าง |

## คำสั่ง

```bash
npm run install:all
npm test                 # server + client
npm run test:coverage    # server coverage (เกณฑ์ขั้นต่ำ 85% lines/functions, 75% branches)
```

## หลักการเลือกกรณีทดสอบ

1. **Happy path** ของทุก endpoint/หน้า
2. **ค่าขอบเขต**: ชื่อ 1 vs 2 ตัวอักษร, details 9 vs 10, limit 0/1/100/101
3. **ชนิดข้อมูลผิด**: ตัวเลข, object, array แทน string
4. **ความล้มเหลวของระบบรอบข้าง**: เครือข่ายล่ม, 500, response ไม่ใช่ JSON
5. **ความปลอดภัยพื้นฐาน**: SQL injection, HTML injection, id ผิดรูปแบบ, field แปลกปลอม
6. **สถานะของ UI**: loading / empty / error / retry / กดซ้ำระหว่างบันทึก

## Manual Test Checklist (ผู้เรียนต้องทำและบันทึกเอง)

| # | สถานการณ์ | ผลที่คาดหวัง | ผลจริง | ผ่าน |
|---|---|---|---|---|
| M-01 | เปิด Dashboard | เห็นรายการ + summary ถูกต้อง | | |
| M-02 | ส่งฟอร์มว่าง | error ใต้ทุกช่อง ไม่เพิ่มรายการ | | |
| M-03 | เพิ่มคำร้องแล้ว refresh | รายการยังอยู่ | | |
| M-04 | ลบแล้ว refresh | รายการหายถาวร | | |
| M-05 | ปิด server แล้วเปิด Dashboard | เห็นข้อความเชื่อมต่อไม่ได้ + ปุ่มลองอีกครั้ง | | |
| M-06 | เปิด `#/requests/REQ-999` | หน้า "ไม่พบคำร้อง" | | |
| M-07 | จอ 375px | ไม่มี horizontal scroll | | |
| M-08 | ใช้คีย์บอร์ดอย่างเดียว | โฟกัสเห็นชัด กดส่งฟอร์มได้ | | |

## สิ่งที่ยังไม่ครอบคลุม (ข้อจำกัด)

- ยังไม่ทดสอบ load/performance
- ไม่ทดสอบหลายเบราว์เซอร์ (e2e ใช้ Chromium)
- `src/server.js` (entry point) ไม่อยู่ใน coverage
