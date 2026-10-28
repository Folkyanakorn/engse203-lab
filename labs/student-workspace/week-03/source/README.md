# ENGSE203 LAB 3 — Starter

ทำตามใบงาน `ENGSE203_LAB03_Web_UI_Responsive_Form_ฉบับขยาย_v2.docx`

```bash
nvm use 22
npm install
npm run dev
```

Starter ใช้ `base: './'` และ build ไป `dist/` หลัง build ให้กลับไป Student Repository root แล้วรัน:

```bash
npm run import:publish -- week-03 labs/week-03/source/dist
npm run build:pages
```


---

## ผู้จัดทำ

- ชื่อ: นาย ญาณากร หวังระบอบ
- รหัสนักศึกษา: 68543210023-6
- Repository: https://github.com/Folkyanakorn/engse203-lab

## ฟีเจอร์

- Semantic HTML: `header`, `main`, `section`, `aside`, `form` พร้อม `label` และ `aria-describedby`
- Responsive แบบ mobile-first (375px ไม่มี horizontal scroll) และสองคอลัมน์บน desktop (>= 768px)
- Live preview จาก `input` event
- Validation: ชื่อ >= 2 ตัวอักษร, ต้องเลือกประเภท, รายละเอียด >= 10 ตัวอักษร
- ถ้าไม่ผ่านจะไม่เพิ่มรายการและไม่ reset ฟอร์ม; ถ้าผ่านจะเพิ่มรายการ แสดงข้อความสำเร็จ และ reset
- ใช้ `textContent` กับข้อมูลผู้ใช้ทั้งหมด

## References & AI Assistance

- ใช้ starter และใบงานของผู้สอน
- ใช้ Claude ช่วยร่างโค้ด ต้องอ่าน ทดสอบ และปรับให้เข้าใจเองก่อนส่ง (แก้ข้อความนี้ให้ตรงกับที่ทำจริง)
