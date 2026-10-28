# week-13 — Unit Testing & Debugging Report

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ (โฟลเดอร์ week-13 ตรงกับ LAB 12) งานนี้สร้างตามหัวข้อ "Unit Testing & Debugging Report" เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

ต่อยอดโปรเจกต์ full-stack ของ week-12 ด้วยชุดทดสอบอัตโนมัติและรายงานการ debug

## วิธีรัน

```bash
npm run install:all
npm test                  # server 84 ข้อ + client 31 ข้อ
npm run test:coverage     # server coverage ~97% (เกณฑ์ขั้นต่ำ 85%)
```

## ผลที่ได้ (รันในเครื่องผู้สร้างงาน)

| ส่วน | ไฟล์ทดสอบ | จำนวน |
|---|---|---|
| server | 6 ไฟล์ (unit + integration กับ SQLite จริง) | 84 ผ่าน |
| client | service, RequestForm, RequestList, DashboardPage | 31 ผ่าน |
| e2e | `e2e/smoke.mjs` (Playwright, ไม่บังคับ) | 14 ผ่าน (รันที่ week-12) |

รายละเอียดแนวทางทดสอบและ manual checklist: `docs/TEST_PLAN.md` · รายงาน debug: `DEBUG_REPORT.md`

## ที่ต้องทำเอง

- ทำ manual checklist (M-01 ถึง M-08) และบันทึกผลจริงใน `docs/TEST_PLAN.md`
- เติมกรณีที่ 3 ใน `DEBUG_REPORT.md` จากบั๊กที่คุณเจอเอง (ถ้าไม่เจอ ให้ลองทำ test ใหม่เพื่อหาบั๊ก เช่น เพิ่ม test ขอบเขตอื่น ๆ)
- อธิบายได้ว่า test แต่ละแบบจับปัญหาอะไร และ coverage สูงไม่ได้แปลว่าไม่มีบั๊ก
