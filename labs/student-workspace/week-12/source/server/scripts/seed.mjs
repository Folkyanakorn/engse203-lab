// รีเซ็ตฐานข้อมูลเป็นข้อมูลตัวอย่าง: npm run db:seed
import { loadConfig } from '../src/config.js';
import { createSqliteRequestService } from '../src/services/sqliteRequestService.js';

const { dbFile } = loadConfig();
const service = createSqliteRequestService({ filename: dbFile });
await service.reset();
console.log(`reset ${dbFile}:`, await service.stats());
service.close();
