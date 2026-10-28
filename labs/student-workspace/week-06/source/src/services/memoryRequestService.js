import { readFile, writeFile } from 'node:fs/promises';

const SEED_PATH = new URL('../../data/initialRequests.json', import.meta.url);

/**
 * Service เก็บข้อมูลในหน่วยความจำ และ (ถ้าระบุ dataPath) เขียนลงไฟล์ JSON
 * ให้ข้อมูลอยู่ต่อหลังรีสตาร์ท — ชั้นอื่นเรียกผ่าน interface เดียวกันนี้
 * (list / get / create / updateStatus / remove) จึงสลับเป็นฐานข้อมูลได้ภายหลัง
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
        // ยังไม่มีไฟล์ข้อมูล: ใช้ seed
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
    async list({ status } = {}) {
      const rows = status ? requests.filter((request) => request.status === status) : requests;
      return structuredClone(rows);
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
    async updateStatus(id, status) {
      const index = requests.findIndex((request) => request.id === id);
      if (index === -1) return null;
      requests = requests.map((request, i) => (i === index ? { ...request, status } : request));
      await persist();
      return structuredClone(requests[index]);
    },
    async remove(id) {
      const before = requests.length;
      requests = requests.filter((request) => request.id !== id);
      if (requests.length === before) return false;
      await persist();
      return true;
    },
  };
}
