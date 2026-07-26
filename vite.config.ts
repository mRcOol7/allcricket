import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const squadsApiPlugin = (): Plugin => ({
  name: 'squads-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/squads', (_req, res) => {
      const filePath = path.resolve(__dirname, 'public/squads.json');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(content);
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Squads API file not found' }));
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), squadsApiPlugin()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api-restcountries': {
        target: 'https://api.restcountries.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-restcountries/, '')
      }
    }
  }
});
