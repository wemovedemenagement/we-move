import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { crmRouter } from './server/crmApi.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req,res,next)=>{
    res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin'});
    next();
  });
  app.use(express.json({ limit: '32kb' }));

  app.use(crmRouter());

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
    if (['entity.parse.failed','entity.too.large'].includes(error.type)) {
      return res.status(error.type==='entity.too.large'?413:400).set('Cache-Control','no-store').json({success:false,error:error.type==='entity.too.large'?'Le formulaire est trop volumineux. Réduisez les précisions saisies.':'Le formulaire transmis est invalide. Veuillez réessayer.'});
    }
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
