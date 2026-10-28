import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// dev: เปิดที่ 5173 และ proxy /api ไปยัง Express (3000) จึงไม่ติดปัญหา CORS ระหว่างพัฒนา
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
