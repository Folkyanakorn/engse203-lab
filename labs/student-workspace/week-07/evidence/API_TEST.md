# API_TEST — LAB 07

ผลจากการรัน `npm test` (vitest + supertest) ในเครื่องผู้สร้างงาน ไม่ใช่ผลจาก Postman

| # | กรณีทดสอบ | ผล |
|---|---|---|
| 1 | test/api.test.js > GET /api/requests > 200 พร้อม X-Total-Count | ผ่าน |
| 2 | test/api.test.js > GET /api/requests > กรองด้วย status / priority / q | ผ่าน |
| 3 | test/api.test.js > GET /api/requests > แบ่งหน้าด้วย limit/offset แต่ total ยังเป็นจำนวนทั้งหมด | ผ่าน |
| 4 | test/api.test.js > GET /api/requests > query ผิด -> 422 พร้อมรายละเอียดรายช่อง | ผ่าน |
| 5 | test/api.test.js > GET /api/requests/:id > 200 / 404 / 400 (รูปแบบ id ผิด) | ผ่าน |
| 6 | test/api.test.js > POST /api/requests > 201 + Location + status pending | ผ่าน |
| 7 | test/api.test.js > POST /api/requests > ไม่รับ status จาก client | ผ่าน |
| 8 | test/api.test.js > POST /api/requests > trim ข้อความ | ผ่าน |
| 9 | test/api.test.js > POST /api/requests > ข้อมูลไม่ครบ -> 422 ระบุทุก field ที่ผิด | ผ่าน |
| 10 | test/api.test.js > POST /api/requests > body ไม่ใช่ object -> 400 | ผ่าน |
| 11 | test/api.test.js > POST /api/requests > JSON เสีย -> 400 INVALID_JSON | ผ่าน |
| 12 | test/api.test.js > POST /api/requests > Content-Type ไม่ใช่ JSON -> 415 | ผ่าน |
| 13 | test/api.test.js > POST /api/requests > body ใหญ่เกิน 10kb -> 413 | ผ่าน |
| 14 | test/api.test.js > PUT / PATCH / DELETE > PUT แทนที่ทั้งชุด ต้องครบทุก field | ผ่าน |
| 15 | test/api.test.js > PUT / PATCH / DELETE > PATCH แก้บาง field โดย field อื่นคงเดิม | ผ่าน |
| 16 | test/api.test.js > PUT / PATCH / DELETE > PATCH body ว่าง -> 400, ค่าผิด -> 422, ไม่พบ -> 404 | ผ่าน |
| 17 | test/api.test.js > PUT / PATCH / DELETE > PATCH เปลี่ยน id ไม่ได้ | ผ่าน |
| 18 | test/api.test.js > PUT / PATCH / DELETE > DELETE 204 แล้ว 404 | ผ่าน |
| 19 | test/api.test.js > อื่น ๆ > เส้นทางที่ไม่มี -> 404 ROUTE_NOT_FOUND | ผ่าน |

สรุป: ผ่าน 19 / 19

## ที่ต้องทำเองเพิ่ม

- ทดสอบด้วย Postman หรือ Thunder Client แล้วแนบ screenshot ใน `images/`
- ทดสอบว่าข้อมูลอยู่ต่อหลังรีสตาร์ทเซิร์ฟเวอร์ (POST → Ctrl+C → `npm start` → GET)
