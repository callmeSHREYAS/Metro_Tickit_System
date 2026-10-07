import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [{
    name: 'normalize-built-html',
    apply: 'build',
    async closeBundle() {
      const htmlPath = resolve(import.meta.dirname, '../src/main/resources/static/index.html');
      const html = await readFile(htmlPath, 'utf8');
      await writeFile(htmlPath, html.replace(/\r\n/g, '\n'));
    }
  }],
  build: {
    outDir: resolve(import.meta.dirname, '../src/main/resources/static'),
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
