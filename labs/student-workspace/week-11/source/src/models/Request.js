import mongoose from 'mongoose';

export const REQUEST_TYPES = ['แจ้งซ่อม', 'ขอใช้ห้อง', 'บริการบัญชีผู้ใช้'];
export const PRIORITIES = ['normal', 'urgent'];
export const STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Schema ของ Mongoose: เป็นด่านตรวจข้อมูลชั้นที่สอง (ต่อจาก validator ของ API)
 * ใช้ publicId (REQ-...) เป็นรหัสที่ client เห็น แทน _id ของ MongoDB เพื่อให้ API contract เดิมไม่เปลี่ยน
 */
const requestSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, match: /^REQ-[A-Z0-9-]+$/ },
    requesterName: { type: String, required: true, trim: true, minlength: 2 },
    requestType: { type: String, required: true, enum: REQUEST_TYPES },
    location: { type: String, required: true, trim: true, minlength: 1 },
    details: { type: String, required: true, trim: true, minlength: 10 },
    priority: { type: String, required: true, enum: PRIORITIES },
    status: { type: String, required: true, enum: STATUSES, default: 'pending' },
  },
  { timestamps: true, versionKey: false },
);

requestSchema.index({ status: 1 });
requestSchema.index({ priority: 1 });

/** แปลง document เป็นรูปแบบตาม API contract (ไม่ส่ง _id / timestamps ออกไป) */
export function toApi(doc) {
  return {
    id: doc.publicId,
    requesterName: doc.requesterName,
    requestType: doc.requestType,
    location: doc.location,
    details: doc.details,
    priority: doc.priority,
    status: doc.status,
  };
}

export const Request = mongoose.models.Request ?? mongoose.model('Request', requestSchema);
