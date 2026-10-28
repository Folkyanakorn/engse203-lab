import { readFileSync } from 'node:fs';
import { Request, toApi } from '../models/Request.js';

const SEED = JSON.parse(readFileSync(new URL('../../data/initialRequests.json', import.meta.url), 'utf8'));
const toDoc = ({ id, ...rest }) => ({ publicId: id, ...rest });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service ที่ใช้ MongoDB ผ่าน Mongoose — interface เดียวกับ memory / sqlite service
 * ต้องเรียก mongoose.connect() ก่อนใช้ (ดู src/db.js)
 */
export function createMongoRequestService() {
  async function createId() {
    for (;;) {
      const time = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).slice(2, 6).toUpperCase();
      const id = `REQ-${time}-${random}`;
      if (!(await Request.exists({ publicId: id }))) return id;
    }
  }

  async function seedIfEmpty() {
    if ((await Request.estimatedDocumentCount()) === 0) await Request.insertMany(SEED.map(toDoc));
  }

  return {
    seedIfEmpty,

    async list({ status, priority, q, limit = 50, offset = 0 } = {}) {
      // สร้าง filter เป็น object ที่กำหนดโครงสร้างเอง: ค่า status/priority ถูก validator จำกัดเป็น enum แล้ว
      // และ q ถูก escape เป็น regex ธรรมดา ป้องกัน NoSQL/regex injection
      const filter = {};
      if (status) filter.status = String(status);
      if (priority) filter.priority = String(priority);
      if (q) {
        const pattern = new RegExp(escapeRegex(q), 'i');
        filter.$or = [{ requesterName: pattern }, { location: pattern }, { details: pattern }, { requestType: pattern }];
      }
      const [docs, total] = await Promise.all([
        Request.find(filter).sort({ createdAt: 1, _id: 1 }).skip(offset).limit(limit).lean(),
        Request.countDocuments(filter),
      ]);
      return { items: docs.map(toApi), total };
    },

    async get(id) {
      const doc = await Request.findOne({ publicId: String(id) }).lean();
      return doc ? toApi(doc) : null;
    },

    async create(input) {
      const doc = await Request.create({ ...input, publicId: await createId(), status: 'pending' });
      return toApi(doc);
    },

    async update(id, fields) {
      const doc = await Request.findOneAndUpdate(
        { publicId: String(id) },
        { $set: fields },
        { new: true, runValidators: true },
      ).lean();
      return doc ? toApi(doc) : null;
    },

    async remove(id) {
      const result = await Request.deleteOne({ publicId: String(id) });
      return result.deletedCount > 0;
    },

    /** aggregation pipeline: นับตามสถานะและความเร่งด่วน */
    async stats() {
      const [byStatus, byPriority, total] = await Promise.all([
        Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Request.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Request.countDocuments(),
      ]);
      const toMap = (rows) => Object.fromEntries(rows.map((row) => [row._id, row.count]));
      return { total, byStatus: toMap(byStatus), byPriority: toMap(byPriority) };
    },

    async reset() {
      await Request.deleteMany({});
      await Request.insertMany(SEED.map(toDoc));
    },
  };
}
