# Delivery Readiness Checklist — week-14

## ก่อนส่งทุกครั้ง

```bash
npm run install:all
npm run verify      # lint + test (server, client) + build + audit
```

- [ ] `npm run verify` ผ่านทั้งหมด (บันทึกผลใน `evidence/`)
- [ ] `git status` ไม่มี `.env`, `*.db`, `node_modules`, `dist`, `coverage`
- [ ] `server/.env.example` ครบทุกตัวแปรที่โค้ดอ่าน และไม่มีค่าลับจริง
- [ ] README บอกวิธีติดตั้ง รัน ทดสอบ และตัวแปร environment ครบ
- [ ] commit มีความหมาย PR อธิบายสิ่งที่เปลี่ยน

## ทดลอง deploy แบบ production ในเครื่อง

```bash
cp server/.env.example server/.env
# แก้: NODE_ENV=production, ALLOW_DEMO_RESET=false (หรือลบบรรทัด), CORS_ORIGIN=http://localhost:3000
npm start           # build client แล้วเปิดที่ http://localhost:3000
curl -i http://localhost:3000/api/health
```

- [ ] เปิดหน้าเว็บที่ `http://localhost:3000` ใช้งานได้ ไม่มี error ใน Console
- [ ] ปุ่ม Reset Demo Data แสดงข้อความปิดการใช้งาน (403) ไม่ล้างข้อมูล
- [ ] ปิดด้วย Ctrl+C แล้วเปิดใหม่ ข้อมูลยังอยู่

## ข้อจำกัดที่ต้องบอกผู้ตรวจ

- ไม่มีระบบ login (ดู SECURITY_CHECKLIST ข้อ 11)
- ฐานข้อมูล SQLite ไฟล์เดียว เหมาะกับ LAB/ผู้ใช้จำนวนน้อย ไม่ใช่ระบบที่มีหลาย instance
- `node:sqlite` ยังเป็น experimental ใน Node.js 22
