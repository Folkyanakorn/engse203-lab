# week-11 — MongoDB, Mongoose & NoSQL CRUD

- ผู้จัดทำ: นาย ญาณากร หวังระบอบ (68543210023-6)
- Repository: https://github.com/Folkyanakorn/engse203-lab

> หมายเหตุ: ใน `labs` ยังไม่มีโจทย์ละเอียดของสัปดาห์นี้ (โฟลเดอร์ week-11 ตรงกับ LAB 10 หัวข้อ MongoDB/Mongoose) งานนี้สร้างตามหัวข้อ เมื่อมีโจทย์จริงให้ตรวจเทียบแล้วปรับ
>
> **ข้อจำกัดสำคัญ:** ผู้สร้างงานไม่มี MongoDB ให้รัน จึงทดสอบ schema และการสร้าง query ด้วย mock เท่านั้น **ส่วนที่คุยกับ MongoDB จริงยังไม่เคยรัน** ต้องรันเองตาม `docs/MONGODB_NOTES.md` และบันทึกผลใน `evidence/`

เปลี่ยนที่เก็บข้อมูลเป็น MongoDB ผ่าน Mongoose โดย route / controller / validator จาก week-07 และ 08 ไม่ต้องแก้

## วิธีรัน

```bash
npm install
cp .env.example .env     # ใส่ MONGODB_URI
npm run dev              # เชื่อมต่อ, seed ถ้าว่าง, เปิดที่ http://localhost:3000
npm run db:seed          # รีเซ็ตข้อมูลตัวอย่าง
npm test                 # schema + query-building (ไม่ต้องมี MongoDB)
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/campus_test npm test   # รวมชุด API กับ MongoDB จริง
```

## โครงสร้างที่เพิ่ม

- `src/models/Request.js` Mongoose schema + `toApi()` (ไม่ส่ง `_id`/timestamps ออก API)
- `src/services/mongoRequestService.js` interface เดียวกับ memory/sqlite (+ `stats()` ด้วย aggregation)
- `src/db.js` เชื่อมต่อ/ตัดการเชื่อมต่อ, `src/server.js` ปิดอย่างเรียบร้อยเมื่อ Ctrl+C
- `docs/MONGODB_NOTES.md` เทียบ SQL กับ MongoDB และเรื่องความปลอดภัย

## หลักฐานที่ต้องทำเอง

- screenshot MongoDB Compass / mongosh แสดง collection `requests`
- ผลรัน `MONGODB_URI_TEST=... npm test` ที่ผ่านทั้งชุด (ถ้ามีข้อใดไม่ผ่านให้แก้และบันทึก)
- อธิบายความต่างระหว่าง `_id` กับ `publicId` และเหตุผลที่เลือกใช้ `publicId`
