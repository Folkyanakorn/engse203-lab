import { existsSync } from 'node:fs';

const required = [
  'package.json', 'README.md', 'src/app.js', 'src/server.js',
  'src/routes/requestRoutes.js', 'src/controllers/requestController.js',
  'src/services/memoryRequestService.js', 'src/validators/requestValidator.js', 'src/errors/AppError.js', 'src/middleware/validateId.js', 'src/middleware/requireJson.js',
  'src/middleware/errorHandler.js', 'src/middleware/logger.js',
  'data/initialRequests.json', 'test/api.test.js',
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('ไม่พบไฟล์:\n' + missing.map((file) => `- ${file}`).join('\n'));
  process.exit(1);
}
console.log('โครงสร้างโปรเจกต์ครบ');
