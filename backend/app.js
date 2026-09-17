import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import projectRoutes from './routes/projectRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const buildPath = fileURLToPath(new URL('../frontend/build/', import.meta.url));

function sendDocument(req, res, file) {
  res.vary('Accept-Encoding').type('html').set('Cache-Control', 'no-cache');
  const encoding = req.acceptsEncodings('br', 'gzip', 'identity');
  if (['br', 'gzip'].includes(encoding)) {
    const compressed = file + (encoding === 'br' ? '.br' : '.gz');
    if (existsSync(compressed)) return res.set('Content-Encoding', encoding).sendFile(compressed);
  }
  return res.sendFile(file);
}

export function createApp({ production = process.env.NODE_ENV === 'production', dataSource = process.env.DATA_SOURCE || 'file' } = {}) {
  if (!['file', 'mongodb'].includes(dataSource)) throw new Error('DATA_SOURCE must be file or mongodb');
  const app = express();
  const scriptHashes = production ? JSON.parse(readFileSync(path.join(buildPath, 'csp-hashes.json'), 'utf8')).join(' ') : '';
  app.locals.dataSource = dataSource;
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' " + scriptHashes + "; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self' https://formspree.io; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action https://formspree.io",
    });
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/projects', projectRoutes);
  app.use('/api', notFound);
  app.get(['/facebook', '/instagram'], (_req, res) => res.redirect(301, '/contact'));

  if (production) {
    app.use('/assets', (req, res, next) => {
      if (!['GET', 'HEAD'].includes(req.method) || !/^\/[a-zA-Z0-9_-]+\.(js|css)$/.test(req.path)) return next();
      res.vary('Accept-Encoding');
      const encoding = req.acceptsEncodings('br', 'gzip', 'identity');
      if (!['br', 'gzip'].includes(encoding)) return next();
      const file = path.join(buildPath, 'assets', req.path.slice(1) + (encoding === 'br' ? '.br' : '.gz'));
      if (!existsSync(file)) return next();
      res.type(path.extname(req.path)).set({ 'Content-Encoding': encoding, 'Cache-Control': 'public, max-age=31536000, immutable' }).sendFile(file);
    });
    app.use('/assets', express.static(path.join(buildPath, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(buildPath, { index: false, redirect: false, maxAge: '1h' }));
    for (const route of ['/', '/projects', '/contact']) {
      app.get(route, (req, res) => {
        sendDocument(req, res, path.join(buildPath, route === '/' ? 'index.html' : route.slice(1) + '/index.html'));
      });
    }
    app.use((req, res, next) => {
      if (!req.accepts('html') || path.extname(req.path)) return next();
      sendDocument(req, res.status(404), path.join(buildPath, '404.html'));
    });
  } else {
    app.get('/', (_req, res) => res.json({ message: 'Portfolio API. Frontend: http://localhost:5173' }));
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
