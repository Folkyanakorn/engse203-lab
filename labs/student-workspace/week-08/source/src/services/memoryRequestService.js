import { readFile, writeFile } from 'node:fs/promises';

const SEED_PATH = new URL('../../data/initialRequests.json', import.meta.url);

/**
 * Interface ของ service: list / get / create / update / remove
 * (ฐานข้อมูลในสัปดาห์หลังต้องทำ interface เดียวกันนี้)
 */
export async function createMemoryRequestService({ dataPath } = {}) {
  let requests = [];

  async function persist() {
    if (dataPath) await writeFile(dataPath, JSON.stringify(requests, null, 2), 'utf8');
  }

  async function load() {
    if (dataPath) {
      try {
        requests = JSON.parse(await readFile(dataPath, 'utf8'));
        return;
      } catch {
        // ไม่มีไฟล์ข้อมูล: ใช้ seed
      }
    }
    requests = JSON.parse(await readFile(SEED_PATH, 'utf8'));
    await persist();
  }

  function createId() {
    let id;
    do {
      const time = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).slice(2, 6).toUpperCase();
      id = `REQ-${time}-${random}`;
    } while (requests.some((request) => request.id === id));
    return id;
  }

  await load();

  return {
    /** คืน { items, total } เมื่อกรอง/ค้นหา/แบ่งหน้า */
    async list({ status, priority, q, limit = 50, offset = 0 } = {}) {
      const filtered = requests.filter((request) => {
        if (status && request.status !== status) return false;
        if (priority && request.priority !== priority) return false;
        if (q) {
          const haystack = `${request.requesterName} ${request.location} ${request.details} ${request.requestType}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
      return { items: structuredClone(filtered.slice(offset, offset + limit)), total: filtered.length };
    },
    async get(id) {
      const found = requests.find((request) => request.id === id);
      return found ? structuredClone(found) : null;
    },
    async create(input) {
      const created = { id: createId(), ...input, status: 'pending' };
      requests = [...requests, created];
      await persist();
      return structuredClone(created);
    },
    async update(id, fields) {
      const index = requests.findIndex((request) => request.id === id);
      if (index === -1) return null;
      const updated = { ...requests[index], ...fields, id };
      requests = requests.map((request, i) => (i === index ? updated : request));
      await persist();
      return structuredClone(updated);
    },
    async remove(id) {
      const before = requests.length;
      requests = requests.filter((request) => request.id !== id);
      if (requests.length === before) return false;
      await persist();
      return true;
    },
    /** ใช้โดย demo reset */
    async reset() {
      requests = JSON.parse(await readFile(SEED_PATH, 'utf8'));
      await persist();
    },
  };
}
