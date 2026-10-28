# ENGSE203 LAB05 — Student Test Report

**ชื่อ–รหัส:** นาย ญาณากร หวังระบอบ (68543210023-6)  
**OS / Browser / Node:** Windows 11 + WSL2 / (ระบุ browser) / Node >=22.12.0  
**Branch / Commit:** `lab/week-05` / (ใส่หลัง commit)

กรอก Actual result จากการรันจริง ใช้ `PASS`, `FAIL` หรือ `NOT RUN` และอ้างหลักฐานแบบ relative path

| Test ID | Preconditions / procedure summary | Actual result | Status | Evidence / Notes |
|---|---|---|---|---|
| TC-L5-01 | เปิด `#/` | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-02 | ใช้ navigation 3 รายการ | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-03 | เปิด/refresh `#/requests/new` | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-04 | เปิด `#/requests/REQ-001` | ยังไม่ได้ทดสอบ | NOT RUN | `images/route-detail-found.png` |
| TC-L5-05 | เปิด `#/requests/REQ-999` | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-06 | เปิด `#/unknown` | ยังไม่ได้ทดสอบ | NOT RUN | `images/route-not-found.png` |
| TC-L5-07 | ลบ LAB05 key แล้วเปิด Dashboard | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-08 | สังเกตช่วง latency | ยังไม่ได้ทดสอบ | NOT RUN | `images/state-loading.png` |
| TC-L5-09 | เปิด `#/?scenario=error` | ยังไม่ได้ทดสอบ | NOT RUN | `images/state-error-retry.png` |
| TC-L5-10 | กด Retry | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-11 | เปิด `#/?scenario=empty` | ยังไม่ได้ทดสอบ | NOT RUN | `images/state-empty.png` |
| TC-L5-12 | รัน public checker | `npm run check` ได้ 133/133 | PASS | command summary |
| TC-L5-13 | submit form ผิด validation | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-14 | เพิ่ม valid request แล้ว refresh | ยังไม่ได้ทดสอบ | NOT RUN | `images/persistence-add-refresh.png` |
| TC-L5-15 | ทดสอบ filters ทุกค่า | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-16 | ลบ request แล้ว refresh | ยังไม่ได้ทดสอบ | NOT RUN | `images/persistence-delete-refresh.png` |
| TC-L5-17 | Reset Demo Data | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-18 | malformed + wrong schema แล้ว reload | ยังไม่ได้ทดสอบ | NOT RUN | `images/storage-recovery.png` |
| TC-L5-19 | เทียบ summary กับ data | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-20 | viewport 375px ทุก page | ยังไม่ได้ทดสอบ | NOT RUN | `images/responsive-375.png` |
| TC-L5-21 | keyboard only | ยังไม่ได้ทดสอบ | NOT RUN | |
| TC-L5-22 | checker/build/preview | check 133/133 และ build ผ่าน (ยังไม่ได้เปิด preview) | NOT RUN | command summary |
| TC-L5-23 | Pages Incognito + hash refresh | ยังไม่ได้ทดสอบ | NOT RUN | `images/pages-incognito.png` + URL |
| TC-L5-24 | merged PR + tag | ยังไม่ได้ทดสอบ | NOT RUN | PR URL + commit/tag |

## Rerun log

เก็บร่องรอย FAIL เดิม แล้วเพิ่มบรรทัด rerun แทนการลบประวัติ

| Test ID | เวลา | Fix | Actual result | Status |
|---|---|---|---|---|
| - | - | - | - | - |
