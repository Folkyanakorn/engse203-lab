# Security Checklist — week-14

อ้างอิงแนวคิดจาก OWASP Top 10 ในระดับที่เหมาะกับแอปขนาดนี้ สถานะ ✅ = มีในโค้ดและมี test, ⚠️ = ต้องตั้งค่า/ตัดสินใจเมื่อ deploy, ❌ = ยังไม่ทำ (ระบุเหตุผล)

| # | ความเสี่ยง | มาตรการ | สถานะ | หลักฐาน |
|---|---|---|---|---|
| 1 | Injection (SQL) | prepared statement ทุกคำสั่ง, whitelist ชื่อคอลัมน์, escape `LIKE`, `CHECK` ใน DB | ✅ | `test/sqlite.test.js` (SQL safety) |
| 2 | Injection (HTML/XSS) | React escape ข้อความอัตโนมัติ ไม่ใช้ `dangerouslySetInnerHTML`; CSP `script-src 'self'` | ✅ | `RequestList.test.jsx` (XSS), `security.test.js` (CSP header) |
| 3 | Broken input validation | validator กลางคืนเฉพาะ field ที่รู้จัก, ชนิดข้อมูลผิดถูกปฏิเสธ, `id` ตรวจรูปแบบ, body ≤ 10kb, ต้องเป็น JSON | ✅ | `validator.test.js`, `api.*.test.js` |
| 4 | Mass assignment / prototype pollution | ไม่ส่ง `req.body` ดิบเข้า service, แก้ `id`/`status` ตอนสร้างไม่ได้ | ✅ | `security.test.js` |
| 5 | Security misconfiguration | `helmet` (CSP, nosniff, frame-ancestors, HSTS), ปิด `X-Powered-By`, ไม่ใช้ CORS `*`, config ไม่ยอมเริ่มเมื่อค่าอันตรายใน production | ✅ | `security.test.js` (config guards) |
| 6 | Information disclosure | error 500 ตอบข้อความกลาง ๆ, ไม่คืน stack/ path ภายใน | ✅ | `security.test.js`, `validator.test.js` |
| 7 | Brute-force / DoS ระดับแอป | rate limit ต่อ IP (ทั่วไป 300/15 นาที, เขียน 60) ตอบ 429 | ✅ | `security.test.js` (rate limiting) |
| 8 | Vulnerable dependencies | `npm audit --omit=dev` ได้ 0 ช่องโหว่ (ผลวันที่สร้างงาน) | ✅ ต้องรันซ้ำก่อนส่ง | `npm run audit` |
| 9 | Secrets | ค่าตั้งค่าอยู่ใน env; `.env` อยู่ใน `.gitignore`; มี `.env.example` ไม่มีค่าจริง | ✅ | ตรวจ `git status` ก่อน commit |
| 10 | Dangerous demo endpoint | `/api/demo/reset` ปิดเป็นค่าเริ่มต้น และ production ห้ามเปิด | ✅ | `fullstack.test.js`, `security.test.js` |
| 11 | Authentication / Authorization | **ไม่มี**: ใครก็สร้าง/แก้/ลบคำร้องได้ | ❌ | นอกขอบเขต LAB; ถ้าใช้งานจริงต้องเพิ่ม login + สิทธิ์ (เช่น เจ้าหน้าที่แก้สถานะ ผู้แจ้งเห็นเฉพาะของตน) |
| 12 | HTTPS | server พูด HTTP; HSTS ส่งไปแล้วแต่ต้องมี TLS ที่ reverse proxy | ⚠️ | ตั้ง `TRUST_PROXY` เมื่ออยู่หลัง proxy |
| 13 | Logging & monitoring | log request พร้อม `X-Request-Id`; ยังไม่เก็บ log ถาวร/แจ้งเตือน | ⚠️ | |
| 14 | ข้อมูลส่วนบุคคล | ชื่อผู้แจ้งเป็นข้อมูลส่วนบุคคล ควรแจ้งวัตถุประสงค์/ระยะเวลาเก็บ | ⚠️ | ใน LAB ใช้ข้อมูลสาธิตเท่านั้น |

## ตรวจด้วยตัวเอง (ผู้เรียนทำและบันทึก)

- [ ] ลอง `curl -i http://localhost:3000/` ดู header ที่ได้
- [ ] ยิงเกินโควตาด้วยตัวเอง (ตั้ง `RATE_LIMIT_MAX=5`) แล้วดู 429 และ header `RateLimit`
- [ ] ลอง `NODE_ENV=production ALLOW_DEMO_RESET=true npm --prefix server start` แล้วดูว่าเซิร์ฟเวอร์ปฏิเสธการเริ่มทำงาน
- [ ] เปิดหน้าเว็บและดู Console ว่าไม่มี CSP violation
- [ ] อธิบายว่าทำไมข้อ 11 สำคัญ และจะออกแบบอย่างไรถ้าต้องเพิ่ม
