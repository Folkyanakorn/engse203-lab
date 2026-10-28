# API_TEST — LAB 06

ผลจากการรัน `npm test` (vitest + supertest) ในเครื่องผู้สร้างงาน ไม่ใช่ผลจาก Postman

| # | กรณีทดสอบ | ผล |
|---|---|---|
| 1 | test/api.test.js > Campus Service API (week-06) > GET / -> 200 | ผ่าน |
| 2 | test/api.test.js > Campus Service API (week-06) > GET /api/requests -> 200 รายการ seed | ผ่าน |
| 3 | test/api.test.js > Campus Service API (week-06) > GET /api/requests/REQ-001 -> 200 | ผ่าน |
| 4 | test/api.test.js > Campus Service API (week-06) > GET /api/requests/REQ-999 -> 404 | ผ่าน |
| 5 | test/api.test.js > Campus Service API (week-06) > POST ข้อมูลถูกต้อง -> 201 และสถานะ pending | ผ่าน |
| 6 | test/api.test.js > Campus Service API (week-06) > POST ข้อมูลไม่ครบ -> 400 พร้อม details | ผ่าน |
| 7 | test/api.test.js > Campus Service API (week-06) > POST JSON เสีย -> 400 | ผ่าน |
| 8 | test/api.test.js > Campus Service API (week-06) > DELETE -> 204 แล้ว GET ซ้ำ -> 404 | ผ่าน |
| 9 | test/api.test.js > Campus Service API (week-06) > DELETE ที่ไม่มี -> 404 | ผ่าน |
| 10 | test/api.test.js > Campus Service API (week-06) > GET ?status=pending กรองรายการ | ผ่าน |
| 11 | test/api.test.js > Campus Service API (week-06) > PUT เปลี่ยนสถานะ -> 200 / สถานะผิด -> 400 | ผ่าน |
| 12 | test/api.test.js > Campus Service API (week-06) > เส้นทางที่ไม่มี -> 404 | ผ่าน |

สรุป: ผ่าน 12 / 12

## ที่ต้องทำเองเพิ่ม

- ทดสอบด้วย Postman หรือ Thunder Client แล้วแนบ screenshot ใน `images/`
- ทดสอบว่าข้อมูลอยู่ต่อหลังรีสตาร์ทเซิร์ฟเวอร์ (POST → Ctrl+C → `npm start` → GET)
