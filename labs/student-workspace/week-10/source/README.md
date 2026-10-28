# week-10 — SQLite & SQL CRUD with Node.js

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ (และชื่อโฟลเดอร์ week-10 ตรงกับ LAB 09 ตามหัวข้อ "SQLite & SQL CRUD") งานนี้สร้างตามหัวข้อ เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ

เปลี่ยนที่เก็บข้อมูลของ API จากหน่วยความจำ/ไฟล์ JSON เป็นฐานข้อมูล SQLite โดยไม่แก้ route และ controller

## วิธีรัน

ต้องใช้ Node.js >= 22.13 (ใช้ `node:sqlite` ในตัว)

```bash
npm install
npm run dev           # สร้าง data/campus.db อัตโนมัติและ seed 3 รายการ
npm run db:seed       # รีเซ็ตเป็นข้อมูลตัวอย่าง
npm test
```

## สิ่งที่เพิ่ม

- `sql/schema.sql` ตารางพร้อม constraint และ index
- `src/services/sqliteRequestService.js` ทำ interface เดียวกับ memory service (+ transaction ตอน reset)
- `GET /api/requests/stats` สรุปด้วย `GROUP BY`
- `docs/SQL_NOTES.md` อธิบาย API → SQL และเรื่องความปลอดภัย
- test: ชุด API เดิม 19 ข้อรันกับทั้ง memory และ SQLite, บวก persistence / SQL injection / CHECK / stats

หน้าเว็บ `client/` จาก week-08 ใช้กับ API นี้ได้ทันที (`npm run client`)

## หลักฐานที่ต้องทำเอง

- screenshot ผลคำสั่ง SQL (`SELECT`, `GROUP BY`) และข้อมูลหลังรีสตาร์ทเซิร์ฟเวอร์
- อธิบายด้วยคำของตัวเองว่า prepared statement ป้องกัน SQL injection อย่างไร
