# API Contract — Campus Service API v1.2

Base URL (dev): `http://localhost:3000` · Content-Type: `application/json` · Encoding: UTF-8

## Resource: Request

| Field | ชนิด | กติกา |
|---|---|---|
| `id` | string | สร้างโดยเซิร์ฟเวอร์ รูปแบบ `REQ-...` แก้ไม่ได้ |
| `requesterName` | string | trim แล้วอย่างน้อย 2 ตัวอักษร |
| `requestType` | enum | `แจ้งซ่อม` · `ขอใช้ห้อง` · `บริการบัญชีผู้ใช้` |
| `location` | string | trim แล้วไม่ว่าง |
| `details` | string | trim แล้วอย่างน้อย 10 ตัวอักษร |
| `priority` | enum | `normal` · `urgent` |
| `status` | enum | `pending` (ค่าเริ่มต้น) · `in-progress` · `completed` |

## Endpoints

| Method | Path | Body | สำเร็จ | Error |
|---|---|---|---|---|
| GET | `/api/health` | - | 200 `{ status, uptimeSeconds }` | - |
| GET | `/api/requests` | - (query: `status`, `priority`, `q`, `limit` 1-100, `offset`) | 200 `Request[]` + `X-Total-Count` | 422 |
| GET | `/api/requests/:id` | - | 200 `Request` | 400, 404 |
| POST | `/api/requests` | requesterName, requestType, location, details, priority | 201 `Request` + `Location` | 400, 413, 415, 422 |
| PUT | `/api/requests/:id` | ทุก field รวม `status` | 200 `Request` | 400, 404, 413, 415, 422 |
| PATCH | `/api/requests/:id` | field ใดก็ได้ อย่างน้อย 1 | 200 `Request` | 400, 404, 413, 415, 422 |
| DELETE | `/api/requests/:id` | - | 204 | 400, 404 |

## Error format

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "ข้อมูลไม่ผ่านการตรวจสอบ",
             "details": [ { "field": "priority", "message": "ต้องเป็น normal, urgent" } ] } }
```

| code | status |
|---|---|
| `BAD_REQUEST`, `INVALID_JSON` | 400 |
| `NOT_FOUND`, `ROUTE_NOT_FOUND` | 404 |
| `PAYLOAD_TOO_LARGE` | 413 |
| `UNSUPPORTED_MEDIA_TYPE` | 415 |
| `VALIDATION_FAILED` | 422 |
| `INTERNAL_ERROR` | 500 (ไม่เปิดเผยรายละเอียดภายใน) |

## CORS

- อนุญาตเฉพาะ origin ใน `CORS_ORIGIN` (ค่าเริ่มต้น `http://localhost:5173`) ไม่ใช้ `*`
- methods: GET, POST, PUT, PATCH, DELETE · request header: `Content-Type`
- header ที่ client อ่านได้: `X-Total-Count`, `Location`, `X-Request-Id`
- preflight (OPTIONS) ตอบ 204 และ cache 600 วินาที

## ตัวอย่าง

```bash
curl -i http://localhost:3000/api/requests?status=pending
curl -i -X POST http://localhost:3000/api/requests -H "Content-Type: application/json" \
  -d '{"requesterName":"ญาณากร","requestType":"แจ้งซ่อม","location":"ห้อง 301","details":"โปรเจกเตอร์เปิดไม่ติด","priority":"normal"}'
```
