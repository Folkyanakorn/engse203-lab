# Debugging Report — week-13

> รูปแบบ: อาการ → สมมติฐาน → วิธีตรวจ → สาเหตุจริง → วิธีแก้ → วิธีป้องกันไม่ให้เกิดซ้ำ
> **กรณีที่ 1 และ 2 เกิดขึ้นจริงระหว่างสร้างโปรเจกต์นี้ (บันทึกจากเหตุการณ์จริง) กรณีที่ 3 ให้ผู้เรียนเติมจากบั๊กที่เจอเองตอนทดสอบ**

## กรณีที่ 1 — หน้าเว็บกลายเป็น JSON ตอนรันแบบ production

| หัวข้อ | รายละเอียด |
|---|---|
| อาการ | เปิด `http://localhost:3000/` แล้วเห็น `{"message":"Campus Service API is running"}` แทนหน้า React; test ของ browser รอ `[data-testid=request-list]` จน timeout |
| สมมติฐาน | (1) build ไม่ได้อยู่ใน `client/dist` (2) path ของ static ผิด (3) มี route อื่นตอบก่อน |
| วิธีตรวจ | ดู log ของ server: มี `GET / -> 200` แต่ **ไม่มี** request ของ `/assets/...` เลย แสดงว่าเบราว์เซอร์ไม่เคยได้ HTML ของ React; `curl -i localhost:3000/` เห็น `Content-Type: application/json` |
| สาเหตุจริง | `app.get('/')` สำหรับตอบข้อมูล API ถูกประกาศ **ก่อน** `express.static` Express เลือก route แรกที่ตรง จึงตอบ JSON ก่อนจะถึง static |
| วิธีแก้ | ย้ายข้อมูล API ไปที่ `GET /api` และปล่อย `/` ให้ static (แก้ test ที่อ้าง `GET /` ด้วย) |
| ป้องกัน | ลำดับ middleware/route สำคัญ — จัดกลุ่ม `/api/*` ไว้ด้วยกันและไม่ใช้ `/` ของ API; มี e2e smoke test ที่เปิดหน้าเว็บจริงเพื่อจับปัญหาแบบนี้ |

## กรณีที่ 2 — Test ผ่านทั้งที่ UI ยังไม่พร้อม (test เขียนผิด ไม่ใช่โค้ดผิด)

| หัวข้อ | รายละเอียด |
|---|---|
| อาการ | e2e รายงานว่าเหลือข้อเดียวที่ไม่ผ่าน: "unknown id → ไม่พบคำร้อง" ทั้งที่ทำงานถูก |
| สมมติฐาน | API ไม่ตอบ 404 หรือ client ไม่แปลง 404 เป็น null |
| วิธีตรวจ | เรียก `curl /api/requests/REQ-999` ได้ 404 ถูกต้อง และ unit test ของ `getRequestById` ผ่าน จึงเปลี่ยนไปดู test เอง: รอ selector `.state-card` ซึ่ง **LoadingState ใช้ class เดียวกัน** test จึงอ่านข้อความตอนยัง "กำลังโหลด" |
| สาเหตุจริง | selector กว้างเกินไป (class ร่วมกันหลายสถานะ) |
| วิธีแก้ | รอข้อความที่ต้องการแทน: `waitForSelector('text=ไม่พบคำร้องรหัส')` |
| ป้องกัน | ใช้ `data-testid` หรือข้อความที่เฉพาะเจาะจงต่อสถานะ ไม่ใช้ class สำหรับการจัดสไตล์เป็นตัวระบุใน test |

## กรณีที่ 3 — (ผู้เรียนเติมเอง)

| หัวข้อ | รายละเอียด |
|---|---|
| อาการ | |
| สมมติฐาน | |
| วิธีตรวจ | (แนบ log / screenshot / DevTools Network) |
| สาเหตุจริง | |
| วิธีแก้ | |
| ป้องกัน | (เช่น เพิ่ม test กรณีไหน) |

## เครื่องมือ debug ที่ใช้ได้

- `curl -i` ดู status + header จริง (แยกปัญหา API ออกจาก UI)
- DevTools → Network (ดู request/response) และ Console
- `console.log` ชั่วคราวใน controller/service (ลบก่อน commit)
- `npx vitest run -t "ชื่อ test"` รันเฉพาะ test ที่สงสัย
- `node --inspect src/server.js` + VS Code debugger
