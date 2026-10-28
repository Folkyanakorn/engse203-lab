# ENGSE203 LAB 4 — React Campus Service Request

## ผู้จัดทำ

- ชื่อ–นามสกุล: นาย ญาณากร หวังระบอบ
- รหัสนักศึกษา: 68543210023-6
- Section: 2

## URLs

- Repository: https://github.com/Folkyanakorn/engse203-lab
- Pull Request: (ใส่หลังเปิด PR)
- GitHub Pages: (ใส่หลัง deploy)

## Component Tree

```text
App            (เป็นเจ้าของ state: requests, statusFilter)
├── AppHeader
├── SummaryPanel   (รับ summary ที่คำนวณจาก requests)
├── RequestForm    (เป็นเจ้าของ state: formData, errors, feedback)
├── FilterBar      (รับ value และเรียก onFilterChange)
└── RequestList
    └── RequestCard (เรียก onDeleteRequest(id))
```

## Setup และ Run

```bash
nvm use
npm install
npm run dev
npm run check
npm run build
npm run preview
```

## State / Props / Callback

- `App` เป็นเจ้าของ `requests` และ `statusFilter` ด้วย `useState`
- summary และ `filteredRequests` เป็น derived data คำนวณจาก state ทุกครั้งที่ render
- props ไหลลง: `summary` → `SummaryPanel`, `requests` → `RequestList` → `RequestCard`, `value` → `FilterBar`
- callback ไหลกลับ: `onAddRequest` (จาก `RequestForm`), `onFilterChange` (จาก `FilterBar`), `onDeleteRequest(id)` (จาก `RequestCard`)
- เพิ่มรายการด้วย `[newRequest, ...currentRequests]` และลบด้วย `filter()` (immutable)
- `RequestForm` เป็น controlled form ทุก field และ validate ตามกติกาของโจทย์ ถ้าไม่ผ่านจะแสดง error ใกล้ field และไม่เพิ่มรายการ

## Test Evidence

บันทึกผลจริงหลังทดสอบเอง (ยังไม่ได้ทดสอบบนเบราว์เซอร์)

| Test ID | Actual Result | Pass/Fail | Evidence/Screenshot |
|---|---|---|---|
| TC-01 Initial | รอบันทึกผล | - | - |
| TC-02 Controlled input | รอบันทึกผล | - | - |
| TC-03 Invalid | รอบันทึกผล | - | - |
| TC-04 Valid add | รอบันทึกผล | - | - |
| TC-05 Filter | รอบันทึกผล | - | - |
| TC-06 All | รอบันทึกผล | - | - |
| TC-07 Empty | รอบันทึกผล | - | - |
| TC-08 Delete | รอบันทึกผล | - | - |
| TC-09 Mobile | รอบันทึกผล | - | - |
| TC-10 Keyboard | รอบันทึกผล | - | - |
| TC-11 Build | `npm run check` และ `npm run build` ผ่านตอนสร้างงาน | Pass | - |
| TC-12 Pages | รอบันทึกผล | - | - |

## Week 03 → Week 04 Reflection

(เขียน 3–5 ประโยคด้วยตัวเอง เปรียบเทียบการแก้ DOM โดยตรงใน Week 03 กับ UI ที่ขับเคลื่อนด้วย state ใน React)

## AI / External Resource Disclosure

ใช้ Claude ช่วยร่างโค้ด App, RequestForm และ RequestList จาก starter และโจทย์ ต้องอ่านโค้ดและทดสอบเองก่อนส่ง แล้วแก้ข้อความนี้ให้ตรงกับที่ทำจริง
