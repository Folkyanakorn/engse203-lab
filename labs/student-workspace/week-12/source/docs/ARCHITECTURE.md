# Architecture — week-12 Full-Stack Integration

```text
Browser (React, HashRouter)
   │  fetch('/api/...')            ← pages เรียกผ่าน services/requestService.js เท่านั้น
   ▼
Express (server/)
   routes → controllers → validators (AppError) → service (interface)
                                                    │
                                                    ▼
                                             SQLite (node:sqlite)
```

- **dev:** Vite (5173) proxy `/api` → Express (3000) จึงไม่ต้องใช้ CORS ระหว่างพัฒนา
- **production:** Express เสิร์ฟ `client/dist` และ `/api` ที่ origin เดียว (3000)
- ข้อมูลอยู่ที่ฐานข้อมูลฝั่งเซิร์ฟเวอร์ ไม่ใช่ localStorage ของเบราว์เซอร์อีกต่อไป

## Data flow ตัวอย่าง: เพิ่มคำร้อง

1. `RequestForm` (controlled form) ตรวจเบื้องต้นฝั่ง client แล้วเรียก `onAddRequest`
2. `NewRequestPage` → `addRequest()` → `POST /api/requests`
3. server: `requireJson` → `parseCreate` (422 ถ้าผิด) → `service.create` → `201 + Location`
4. client ได้ `id` ใหม่ แล้ว `navigate('/requests/<id>')` และหน้า Detail ดึงจาก `GET /api/requests/:id`

## จุดที่ต้องระวังตอน integrate

| ปัญหา | วิธีที่ใช้ |
|---|---|
| รูปแบบ error ของ API ต่างจาก UI เดิม | `toError()` ใน requestService แปลง `{ error: { message, details } }` เป็นข้อความ |
| API ตอบ 404 แต่ UI ต้องแสดง "ไม่พบ" | `getRequestById` คืน `null` เมื่อ 404 |
| route `/` ของ API ไปบังหน้าเว็บ | ย้ายข้อมูล API ไปที่ `/api` (ดู week-13 DEBUG_REPORT) |
| ปุ่ม Reset Demo Data อันตรายถ้าเปิดบน production | endpoint ปิดเป็นค่าเริ่มต้น เปิดด้วย `ALLOW_DEMO_RESET=true` |
