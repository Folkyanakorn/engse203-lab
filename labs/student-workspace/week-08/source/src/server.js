import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createMemoryRequestService } from './services/memoryRequestService.js';

const config = loadConfig();
const service = await createMemoryRequestService({
  dataPath: new URL('../data/requests.json', import.meta.url),
});

createApp({ service, corsOrigins: config.corsOrigins }).listen(config.port, () => {
  console.log(`Campus Service API: http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`CORS อนุญาต: ${config.corsOrigins.join(', ')}`);
});
