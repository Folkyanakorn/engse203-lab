import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// ไม่หน่วงเวลาจำลองของ service ในการทดสอบ
globalThis.__ENGSE203_SKIP_DELAY__ = true;

afterEach(() => cleanup());
