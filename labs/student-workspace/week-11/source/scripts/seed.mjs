// รีเซ็ตคอลเลกชันเป็นข้อมูลตัวอย่าง: npm run db:seed
import { loadConfig } from '../src/config.js';
import { connectDb, disconnectDb } from '../src/db.js';
import { createMongoRequestService } from '../src/services/mongoRequestService.js';

await connectDb(loadConfig().mongoUri);
const service = createMongoRequestService();
await service.reset();
console.log('reset แล้ว:', await service.stats());
await disconnectDb();
