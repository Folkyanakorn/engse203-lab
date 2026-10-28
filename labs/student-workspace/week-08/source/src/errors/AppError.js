/** error ที่ตั้งใจโยน: มี status code, รหัส error และรายละเอียดสำหรับผู้เรียก API */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, 'BAD_REQUEST', message, details);
export const validationFailed = (details) => new AppError(422, 'VALIDATION_FAILED', 'ข้อมูลไม่ผ่านการตรวจสอบ', details);
export const notFoundError = (message) => new AppError(404, 'NOT_FOUND', message);
export const unsupportedMediaType = () => new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'ต้องส่งข้อมูลเป็น application/json');
