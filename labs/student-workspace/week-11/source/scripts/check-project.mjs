import { existsSync } from 'node:fs';

const required = [
  'package.json', 'README.md', 'src/app.js', 'src/server.js',
  'src/routes/requestRoutes.js', 'src/controllers/requestController.js',
  'src/services/memoryRequestService.js', 'src/services/mongoRequestService.js', 'src/models/Request.js', 'src/db.js', 'docs/MONGODB_NOTES.md', 'src/validators/requestValidator.js', 'src/errors/AppError.js', 'src/middleware/validateId.js', 'src/middleware/requireJson.js',
  'src/middleware/errorHandler.js', 'src/middleware/logger.js', 'src/middleware/cors.js', 'src/config.js', 'client/index.html', 'client/app.js', '.env.example',
  'data/initialRequests.json', 'test/api.memory.test.js', 'test/api.mongo.test.js', 'test/mongo-unit.test.js',
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('ไม่พบไฟล์:\n' + missing.map((file) => `- ${file}`).join('\n'));
  process.exit(1);
}
console.log('โครงสร้างโปรเจกต์ครบ');
