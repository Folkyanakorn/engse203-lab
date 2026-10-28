# ENGSE203 Learning Dashboard

> LAB 02 — Modern JavaScript, Modules & Async Data

## Student Information

- Student ID: 68543210023-6
- Name: นาย ญาณากร หวังระบอบ
- Operating system: Windows 11 + WSL2 (Ubuntu 24.04)
- GitHub Pages URL: (เพิ่มหลัง deploy) repo: https://github.com/Folkyanakorn/engse203-lab

## Project Overview

เว็บ Vanilla JS + Vite โหลดข้อมูลจาก `public/data/learning-tasks.json` ด้วย `fetch` + `async/await` แสดง summary 4 ช่อง ค้นหาจากชื่อ/หัวข้อ/tag กรองตามสถานะ และแสดงสถานะ loading/success/error (ทดสอบ error ด้วย `?simulateError=1`)

- `api.js` โหลด JSON และตรวจ `response.ok`
- `utils.js` ฟังก์ชัน pure: `getStatusLabel`, `filterTasks`, `getStats`
- `ui.js` render ด้วย DOM API (`textContent`) พร้อม empty state
- `main.js` ควบคุม state และ `try/catch/finally`

## Installation and Run

```bash
npm install
npm run check
npm run dev
```

## Build and Preview

```bash
npm run build
npm run preview
```

## Test Evidence

- Normal state screenshot: `<add image path or markdown image>`
- Error state screenshot (`?simulateError=1`): `<add image path or markdown image>`

## Problems and Fixes

(เขียนปัญหาที่พบจริงอย่างน้อย 1 ข้อ และวิธีแก้)

## References & AI Assistance

- References used: เอกสารใน `docs/` ของ LAB 02 และ starter ของผู้สอน
- AI assistance used: ใช้ Claude ช่วยร่างโค้ดจากโจทย์ ผู้ทำต้องอ่านและทดสอบเองก่อนส่ง (แก้ข้อความนี้ให้ตรงกับที่ทำจริง)
