import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';

import manifest from './manifest.config';

// https://vitejs.dev/config/
export default defineConfig(({ command, ...config }) => ({
  ...config,
  build: {
    outDir: command === 'build' ? 'dist' : '.vite-dev',
    rollupOptions: {
      input: {
        // output file at '/index.html'
        welcome: resolve(__dirname, 'index.html'),
        // output file at '/src/popup/index.html'
        popup: resolve(__dirname, 'src/popup/index.html'),
        devTools: resolve(__dirname, 'src/devTools/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
      },
    },
  },
  plugins: [crx({ manifest })],
}));
