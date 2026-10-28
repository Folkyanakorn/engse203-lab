const REQUEST_TYPES = ['แจ้งซ่อม', 'บริการบัญชีผู้ใช้', 'ขอใช้อุปกรณ์', 'อื่น ๆ'];
const PRIORITIES = ['normal', 'urgent'];

/** ตัวช่วยอ่านข้อความอย่างปลอดภัย — ให้มาแล้ว */
function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateSchema(schema) {
  return (req, res, next) => {
    const input = req.body;
    if (!input || typeof input !== 'object') {
      return res.status(400).json({ error: 'ต้องส่งข้อมูลคำร้องมาด้วย' });
    }

    const errors = [];
    
    for(const [field , validatorFn] of Object.entries(schema)) {
      const errorMessage = validatorFn(input[field]);
      if (errorMessage) {
        errors.push(errorMessage);
      }
    }
    if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลคำร้องไม่ถูกต้อง', details: errors });
    }
    next();
  };
}

const requestSchema = {
  requesterName : (v) => readText(v).length < 2 ? 'ชื่อผู้แจ้งต้องมีอย่างน้อย 2 ตัวอักษร' : null,
  requestType : (v) => !REQUEST_TYPES.includes(v) ? 'ประเภทคำร้องไม่ถูกต้อง' : null,
  location : (v) => !readText(v) ? 'กรุณาระบุสถานที่' : null,
  details : (v) => readText(v).length < 10 ? 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร' : null,
  priority : (v) => !PRIORITIES.includes (v) ? 'ความเร่งด่วนต้องเป็น normal หรือ urgent' : null
};

export const validateRequest = validateSchema(requestSchema);
