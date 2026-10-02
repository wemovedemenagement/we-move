import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import express from 'express';
import { crmRouter } from './server/crmApi.mjs';

function crmApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-crm-api',
    configureServer(server) {
      const api = express();
      api.disable('x-powered-by');
      api.use(express.json({ limit: '32kb' }));
      api.use(crmRouter());
      server.middlewares.use('/api', (req, res, next) => {
        req.url = '/api' + req.url;
        api(req as express.Request, res as express.Response, next);
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), crmApiPlugin()],
    build: { manifest: true },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
