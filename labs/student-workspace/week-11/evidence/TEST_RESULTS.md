# Test Results — LAB 11 (MongoDB — ชุดที่ใช้ MongoDB จริงถูกข้าม)

ผลจากการรัน `npx vitest run` ในเครื่องผู้สร้างงาน (ไม่ใช่ผลจากเครื่องของผู้เรียน) ให้รันซ้ำเองและแนบ screenshot

```text
 ↓ test/api.mongo.test.js (19 tests | 19 skipped)
 ✓ test/api.memory.test.js (19 tests) 135ms
 ✓ test/mongo-unit.test.js (14 tests) 18ms
 ✓ test/cors-config.test.js (9 tests) 85ms
 Test Files  3 passed | 1 skipped (4)
      Tests  42 passed | 19 skipped (61)
```

## ที่ต้องทำเอง

- รัน `npm test` บนเครื่องของตัวเองและแนบผล
- ทดสอบด้วย Postman/Thunder Client และเบราว์เซอร์ แล้วใส่ screenshot ใน `images/`
