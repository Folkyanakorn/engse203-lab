import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

// โหลดผ่าน createRequire เพราะ vitest/vite ยังไม่รู้จัก 'node:sqlite' เป็นโมดูลในตัว (ผลลัพธ์เหมือน import ปกติ)
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');

const SCHEMA_SQL = readFileSync(new URL('../../sql/schema.sql', import.meta.url), 'utf8');
const SEED = JSON.parse(readFileSync(new URL('../../data/initialRequests.json', import.meta.url), 'utf8'));

/** แปลง snake_case ของฐานข้อมูล เป็นรูปแบบเดียวกับ API contract */
const toApi = (row) => ({
  id: row.id,
  requesterName: row.requester_name,
  requestType: row.request_type,
  location: row.location,
  details: row.details,
  priority: row.priority,
  status: row.status,
});

/** whitelist ชื่อ field -> ชื่อคอลัมน์ (ชื่อคอลัมน์ใน SQL มาจากตารางนี้เท่านั้น ไม่เคยมาจากผู้ใช้) */
const COLUMNS = {
  requesterName: 'requester_name',
  requestType: 'request_type',
  location: 'location',
  details: 'details',
  priority: 'priority',
  status: 'status',
};

/**
 * Service ที่ใช้ SQLite (node:sqlite) interface เดียวกับ memory service
 * ทุกคำสั่งใช้ prepared statement + พารามิเตอร์ (?) ห้ามต่อ string ของผู้ใช้เข้า SQL
 */
export function createSqliteRequestService({ filename = ':memory:' } = {}) {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA_SQL);

  const insert = db.prepare(`
    INSERT INTO requests (id, requester_name, request_type, location, details, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const selectOne = db.prepare('SELECT * FROM requests WHERE id = ?');
  const deleteOne = db.prepare('DELETE FROM requests WHERE id = ?');
  const countAll = db.prepare('SELECT COUNT(*) AS n FROM requests');

  const insertSeed = () => {
    for (const r of SEED) {
      insert.run(r.id, r.requesterName, r.requestType, r.location, r.details, r.priority, r.status);
    }
  };
  if (countAll.get().n === 0) insertSeed();

  function transaction(work) {
    db.exec('BEGIN');
    try {
      const result = work();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  function createId() {
    let id;
    do {
      const time = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).slice(2, 6).toUpperCase();
      id = `REQ-${time}-${random}`;
    } while (selectOne.get(id));
    return id;
  }

  return {
    async list({ status, priority, q, limit = 50, offset = 0 } = {}) {
      // โครงสร้าง WHERE ประกอบจากเงื่อนไขที่กำหนดในโค้ด ค่าจากผู้ใช้ส่งผ่านพารามิเตอร์เท่านั้น
      const conditions = [];
      const params = [];
      if (status) { conditions.push('status = ?'); params.push(status); }
      if (priority) { conditions.push('priority = ?'); params.push(priority); }
      if (q) {
        conditions.push("lower(requester_name || ' ' || location || ' ' || details || ' ' || request_type) LIKE ? ESCAPE '\\'");
        params.push(`%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const total = db.prepare(`SELECT COUNT(*) AS n FROM requests ${where}`).get(...params).n;
      const rows = db
        .prepare(`SELECT * FROM requests ${where} ORDER BY created_at, rowid LIMIT ? OFFSET ?`)
        .all(...params, limit, offset);
      return { items: rows.map(toApi), total };
    },

    async get(id) {
      const row = selectOne.get(id);
      return row ? toApi(row) : null;
    },

    async create(input) {
      const id = createId();
      insert.run(id, input.requesterName, input.requestType, input.location, input.details, input.priority, 'pending');
      return toApi(selectOne.get(id));
    },

    async update(id, fields) {
      const entries = Object.entries(fields).filter(([key]) => key in COLUMNS);
      if (entries.length === 0) return this.get(id);
      const assignments = entries.map(([key]) => `${COLUMNS[key]} = ?`).join(', ');
      const result = db
        .prepare(`UPDATE requests SET ${assignments}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`)
        .run(...entries.map(([, value]) => value), id);
      return result.changes === 0 ? null : toApi(selectOne.get(id));
    },

    async remove(id) {
      return deleteOne.run(id).changes > 0;
    },

    /** สรุปจำนวนแยกตามสถานะและความเร่งด่วนด้วย GROUP BY */
    async stats() {
      const byStatus = db.prepare('SELECT status, COUNT(*) AS count FROM requests GROUP BY status').all();
      const byPriority = db.prepare('SELECT priority, COUNT(*) AS count FROM requests GROUP BY priority').all();
      return {
        total: countAll.get().n,
        byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row.count])),
        byPriority: Object.fromEntries(byPriority.map((row) => [row.priority, row.count])),
      };
    },

    async reset() {
      transaction(() => {
        db.exec('DELETE FROM requests');
        insertSeed();
      });
    },

    close() {
      db.close();
    },
  };
}
