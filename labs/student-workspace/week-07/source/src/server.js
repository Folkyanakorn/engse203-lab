import { createApp } from './app.js';
import { createMemoryRequestService } from './services/memoryRequestService.js';

const PORT = Number(process.env.PORT ?? 3000);
const DATA_PATH = new URL('../data/requests.json', import.meta.url);

const service = await createMemoryRequestService({ dataPath: DATA_PATH });
createApp({ service }).listen(PORT, () => {
  console.log(`Campus Service API: http://localhost:${PORT}`);
});
