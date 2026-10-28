-- ตาราง requests: CHECK constraint ให้ฐานข้อมูลช่วยป้องกันข้อมูลผิดอีกชั้นหนึ่ง
CREATE TABLE IF NOT EXISTS requests (
  id             TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL CHECK (length(trim(requester_name)) >= 2),
  request_type   TEXT NOT NULL CHECK (request_type IN ('แจ้งซ่อม', 'ขอใช้ห้อง', 'บริการบัญชีผู้ใช้')),
  location       TEXT NOT NULL CHECK (length(trim(location)) > 0),
  details        TEXT NOT NULL CHECK (length(trim(details)) >= 10),
  priority       TEXT NOT NULL CHECK (priority IN ('normal', 'urgent')),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_status   ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests (priority);
