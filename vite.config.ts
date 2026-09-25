import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  getAllQuotes,
  createQuoteLead,
  updateQuoteLead,
  deleteQuoteLead,
  getCrmStats
} from './server/crmStore.mjs';

function crmApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-crm-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqUrl = req.url || '';
        if (!reqUrl.startsWith('/api/')) return next();

        let bodyData = '';
        req.on('data', chunk => { bodyData += chunk; });
        req.on('end', () => {
          let body = {};
          if (bodyData) {
            try { body = JSON.parse(bodyData); } catch {}
          }

          res.setHeader('Content-Type', 'application/json');

          // GET /api/quotes
          if (req.method === 'GET' && reqUrl.startsWith('/api/quotes')) {
            try {
              const urlObj = new URL(reqUrl, 'http://localhost');
              const search = urlObj.searchParams.get('search')?.toLowerCase();
              const status = urlObj.searchParams.get('status');
              let quotes = getAllQuotes();

              if (status && status !== 'all') {
                quotes = quotes.filter((q: any) => q.status === status);
              }
              if (search) {
                quotes = quotes.filter((q: any) =>
                  q.fullName?.toLowerCase().includes(search) ||
                  q.email?.toLowerCase().includes(search) ||
                  q.phone?.includes(search) ||
                  q.id?.toLowerCase().includes(search) ||
                  q.departureAddress?.toLowerCase().includes(search) ||
                  q.arrivalAddress?.toLowerCase().includes(search)
                );
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: quotes.length, quotes }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }

          // POST /api/quotes
          if (req.method === 'POST' && reqUrl === '/api/quotes') {
            try {
              const quote = createQuoteLead(body);
              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, quote }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }

          // PATCH /api/quotes/:id
          if (req.method === 'PATCH' && reqUrl.startsWith('/api/quotes/')) {
            try {
              const id = reqUrl.replace('/api/quotes/', '').split('?')[0];
              const updated = updateQuoteLead(id, body);
              if (!updated) {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false, error: 'Quote not found' }));
                return;
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, quote: updated }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }

          // DELETE /api/quotes/:id
          if (req.method === 'DELETE' && reqUrl.startsWith('/api/quotes/')) {
            try {
              const id = reqUrl.replace('/api/quotes/', '').split('?')[0];
              const deleted = deleteQuoteLead(id);
              if (!deleted) {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false, error: 'Quote not found' }));
                return;
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }

          // GET /api/crm/stats
          if (req.method === 'GET' && reqUrl === '/api/crm/stats') {
            try {
              const stats = getCrmStats();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, stats }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }

          next();
        });
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
        '@': path.resolve(__dirname, '.'),
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
