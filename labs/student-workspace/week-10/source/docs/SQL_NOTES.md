# SQL Notes — week-10

ฐานข้อมูล: SQLite ผ่าน `node:sqlite` (ในตัว Node.js 22.13+ ไม่ต้องติดตั้งไดรเวอร์ ปัจจุบันยังเป็น experimental จึงมี warning ตอนรัน)

## Schema

ดู `sql/schema.sql` ตาราง `requests` มี `PRIMARY KEY`, `NOT NULL`, `CHECK` (ความยาว/ค่าที่อนุญาต), `DEFAULT` และ index บน `status`, `priority`

## CRUD → SQL

| API | SQL (ใช้ `?` เป็นพารามิเตอร์เสมอ) |
|---|---|
| GET /api/requests | `SELECT * FROM requests [WHERE ...] ORDER BY created_at, rowid LIMIT ? OFFSET ?` และ `SELECT COUNT(*)` สำหรับ `X-Total-Count` |
| GET /api/requests/:id | `SELECT * FROM requests WHERE id = ?` |
| POST | `INSERT INTO requests (...) VALUES (?, ?, ?, ?, ?, ?, ?)` |
| PUT / PATCH | `UPDATE requests SET <คอลัมน์ใน whitelist> = ?, updated_at = ... WHERE id = ?` |
| DELETE | `DELETE FROM requests WHERE id = ?` (ดู `changes` เพื่อตอบ 404) |
| GET /api/requests/stats | `SELECT status, COUNT(*) FROM requests GROUP BY status` (และ priority) |

## ความปลอดภัยของ SQL

- ค่าจากผู้ใช้ส่งผ่าน prepared statement เท่านั้น ไม่ต่อ string เข้า SQL
- ชื่อคอลัมน์ใน `UPDATE` มาจาก whitelist `COLUMNS` ในโค้ด
- `LIKE` escape `%`, `_`, `\` เพื่อไม่ให้ผู้ใช้ใช้เป็น wildcard
- ฐานข้อมูลมี `CHECK` เป็นด่านที่สองต่อจาก validator

## ลองด้วยตัวเอง

```bash
npm run db:seed
node --env-file-if-exists=.env -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('data/campus.db');console.log(d.prepare('SELECT status, COUNT(*) c FROM requests GROUP BY status').all())"
```

## เหตุผลที่ service ใช้ interface เดียวกับ week-07/08

controller และ route ไม่ต้องแก้เลย เปลี่ยนแค่ `server.js` เลือก service ใหม่ และ test ชุดเดียวกัน (`api.memory.test.js` / `api.sqlite.test.js`) พิสูจน์ว่าพฤติกรรม API เหมือนกันทั้งสองแบบ
