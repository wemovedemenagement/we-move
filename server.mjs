import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import {
  getAllQuotes,
  createQuoteLead,
  updateQuoteLead,
  deleteQuoteLead,
  getCrmStats
} from './server/crmStore.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // API Endpoints for CRM & Quotes
  app.get('/api/quotes', (req, res) => {
    try {
      let quotes = getAllQuotes();
      const search = req.query.search?.toString().toLowerCase();
      const status = req.query.status?.toString();

      if (status && status !== 'all') {
        quotes = quotes.filter(q => q.status === status);
      }

      if (search) {
        quotes = quotes.filter(q =>
          q.fullName?.toLowerCase().includes(search) ||
          q.email?.toLowerCase().includes(search) ||
          q.phone?.includes(search) ||
          q.id?.toLowerCase().includes(search) ||
          q.departureAddress?.toLowerCase().includes(search) ||
          q.arrivalAddress?.toLowerCase().includes(search)
        );
      }

      res.json({ success: true, count: quotes.length, quotes });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/quotes', (req, res) => {
    try {
      const quote = createQuoteLead(req.body);
      res.status(201).json({ success: true, quote });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/quotes/:id', (req, res) => {
    try {
      const updated = updateQuoteLead(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Quote not found' });
      res.json({ success: true, quote: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/quotes/:id', (req, res) => {
    try {
      const deleted = deleteQuoteLead(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Quote not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/crm/stats', (req, res) => {
    try {
      const stats = getCrmStats();
      res.json({ success: true, stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve Static Assets & SPA Client
  if (existsSync(path.join(dist, 'index.html'))) {
    app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
    app.use(express.static(dist, { index: 'index.html', dotfiles: 'deny', maxAge: 0 }));
    app.use((req, res) => {
      res.status(404).set('Cache-Control', 'no-store');
      if (req.accepts('html')) res.sendFile(path.join(dist, '404.html'));
      else res.type('text').send('Not found');
    });
  }

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(error.status === 404 ? 404 : 500).type('text').send(error.status === 404 ? 'Not found' : 'Server error');
  });

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const server = createApp().listen(port, '0.0.0.0', () => console.log(`We Move CRM & API Server listening on port ${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
