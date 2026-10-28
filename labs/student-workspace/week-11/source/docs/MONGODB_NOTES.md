# MongoDB / Mongoose Notes — week-11

## เตรียม MongoDB

เลือกอย่างใดอย่างหนึ่ง แล้วใส่ใน `.env` (คัดลอกจาก `.env.example`)

- MongoDB Community Server ในเครื่อง: `MONGODB_URI=mongodb://127.0.0.1:27017/campus_service`
- MongoDB Atlas (free tier): ใช้ connection string ของ cluster (ห้าม commit `.env`)
- Docker: `docker run -d -p 27017:27017 --name campus-mongo mongo:7`

## SQL → MongoDB

| แนวคิด | SQLite (week-10) | MongoDB/Mongoose (week-11) |
|---|---|---|
| โครงสร้าง | table + CHECK | collection + Schema (`enum`, `minlength`, `required`) |
| แถว/เอกสาร | row | document (JSON) |
| รหัส | `id TEXT PRIMARY KEY` | `publicId` (unique) แยกจาก `_id` เพื่อรักษา API contract |
| กรอง | `WHERE status = ?` | `find({ status })` |
| ค้นหา | `LIKE ? ESCAPE` | `$regex` ที่ escape แล้ว |
| นับกลุ่ม | `GROUP BY` | `aggregate([{ $group }])` |
| แก้ไข | `UPDATE ... SET` | `findOneAndUpdate({ $set }, { runValidators: true })` |

## ความปลอดภัย

- ค่าที่ใช้ใน filter ถูกแปลงเป็น string เสมอ กัน NoSQL operator injection เช่น `?status[$ne]=x`
- `q` ถูก escape ก่อนทำ regex กัน ReDoS/regex injection
- URI และรหัสผ่านอยู่ใน env เท่านั้น

## รันทดสอบกับ MongoDB จริง

```bash
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/campus_test npm test
```

ชุด `api.mongo.test.js` จะรันชุด API เดียวกับ week-07 และ **ลบฐานข้อมูลทดสอบทิ้งเมื่อจบ** (อย่าชี้ไปฐานข้อมูลจริง) ถ้าไม่ตั้งตัวแปร ชุดนี้จะถูกข้าม
