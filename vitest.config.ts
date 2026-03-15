import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      'next/navigation': resolve(__dirname, '__mocks__/next/navigation.ts'),
      'next/image': resolve(__dirname, '__mocks__/next/image.tsx'),
      'lucide-react': resolve(__dirname, '__mocks__/lucide-react.ts'),
    },
  },
});
