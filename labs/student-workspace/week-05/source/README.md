# ENGSE203 LAB 05 — Routed Campus Service Request

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab
- Pull Request / Pages: (ใส่หลังส่งงาน)

## Run

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

## สถาปัตยกรรม

- `main.jsx` ครอบแอปด้วย `HashRouter` (ใช้ได้บน GitHub Pages)
- `App.jsx` กำหนด 5 เส้นทาง: `/`, `/requests/new`, `/requests/:requestId`, `/about`, `*`
- `pages/` เรียก Service เท่านั้น ไม่แตะ `fetch` หรือ `localStorage` โดยตรง
- `services/requestService.js` โหลด seed JSON, เพิ่ม, ลบ, รีเซ็ต และกู้คืนเมื่อข้อมูลเสีย
- `services/requestStorage.js` เป็นที่เดียวที่แตะ `localStorage` พร้อมตรวจ schema/ID ซ้ำ
- Effect ใน Dashboard และ Detail มี guard (`ignore`) กัน stale update
- มี 5 สถานะ: loading, success, empty, error และ retry (ทดสอบด้วย `#/?scenario=error` และ `#/?scenario=empty`)
- Reset Demo Data คืนข้อมูลตัวอย่าง และ storage ที่เสียหายจะถูกกู้คืนพร้อมแจ้งผู้ใช้

## ผลการตรวจ

- `npm run check` ได้ 133/133 และ `npm run build` ผ่านตอนสร้างงาน
- การทดสอบบนเบราว์เซอร์ (TC-L5-01–24) ยังไม่ได้ทำ ดู `../evidence/TEST_REPORT.md`

## การใช้ AI

ดู `../evidence/AI_USAGE.md`
