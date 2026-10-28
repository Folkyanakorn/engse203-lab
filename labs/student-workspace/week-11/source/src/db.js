import mongoose from 'mongoose';

/** เชื่อมต่อ MongoDB (URI มาจาก environment variable ห้ามฝังรหัสผ่านในโค้ด) */
export async function connectDb(uri) {
  if (!uri) throw new Error('ไม่ได้ตั้งค่า MONGODB_URI (ดู .env.example)');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
