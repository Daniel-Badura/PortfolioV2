import { build, createServer } from 'vite';
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'build');
const projects = JSON.parse(await readFile(new URL('../../shared/projects.json', import.meta.url), 'utf8'));
async function writeCompressed(file, content) {
  await writeFile(file + '.gz', gzipSync(content, { level: 9 }));
  await writeFile(file + '.br', brotliCompressSync(content));
}
process.chdir(root);

let siteUrl = '';
if (process.env.SITE_URL) {
  const url = new URL(process.env.SITE_URL);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an absolute origin, e.g. https://example.com');
  }
  siteUrl = url.origin;
} else {
  console.info('SITE_URL is unset: canonical URLs and sitemap are intentionally omitted.');
}
await build();
const template = await readFile(path.join(output, 'index.html'), 'utf8');
const server = await createServer({ mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

try {
  const { render, pages, profile } = await server.ssrLoadModule('/src/entry-server.tsx');
  const person = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: profile.name, jobTitle: profile.role,
    ...(siteUrl ? { url: siteUrl } : {}),
    sameAs: [profile.github, profile.linkedin],
  }).replace(/</g, '\\u003c');
  const hashes = ["'sha256-" + createHash('sha256').update(person).digest('base64') + "'"];
  await writeFile(path.join(output, 'csp-hashes.json'), JSON.stringify(hashes));

  for (const route of [...Object.keys(pages), '/404']) {
    const metadata = pages[route] || { title: 'Page not found — Daniel Badura', description: 'This page could not be found.' };
    const url = siteUrl + (route === '/' ? '/' : route);
    const tags = [
      '<script type="application/ld+json">' + person + '</script>',
      ...(siteUrl && route !== '/404' ? [
        '<link rel="canonical" href="' + escape(url) + '" />',
        '<meta property="og:url" content="' + escape(url) + '" />',
        '<meta property="og:image" content="' + escape(siteUrl + '/social-preview.png') + '" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:alt" content="Daniel Badura — DevOps / Platform Engineer" />',
      ] : []),
    ].join('\n    ');
    let html = template.replace('<div id="root"></div>', '<div id="root">' + render(route) + '</div>')
      .replace(/<title>.*?<\/title>/, '<title>' + escape(metadata.title) + '</title>')
      .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + escape(metadata.description) + '$2')
      .replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + escape(metadata.title) + '$2')
      .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + escape(metadata.description) + '$2')
      .replace('<!--site-metadata-->', tags);
    if (route === '/404') html = html.replace('content="index,follow"', 'content="noindex,follow"');
    const destination = route === '/' ? path.join(output, 'index.html') : route === '/404' ? path.join(output, '404.html') : path.join(output, route.slice(1), 'index.html');
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
    await writeCompressed(destination, html);
  }
  await mkdir(path.join(output, 'images'), { recursive: true });
  const images = projects.flatMap(project => [project.image.slice(1), project.image.slice(1).replace('.webp', '-360.webp'), project.image.slice(1).replace('.webp', '-540.webp')]);
  for (const file of ['favicon.svg', 'manifest.json', 'no-script.css', 'social-preview.png', ...images]) {
    await copyFile(path.join(root, 'public', file), path.join(output, file));
  }
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (siteUrl ? 'Sitemap: ' + siteUrl + '/sitemap.xml\n' : ''));
  if (siteUrl) await writeFile(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + Object.keys(pages).map(route => '<url><loc>' + escape(siteUrl + route) + '</loc></url>').join('') + '</urlset>');
  for (const file of await readdir(path.join(output, 'assets'))) {
    if (!/\.(js|css)$/.test(file)) continue;
    const asset = path.join(output, 'assets', file);
    const content = await readFile(asset);
    await writeCompressed(asset, content);
  }
  console.log('Prerendered overview, projects, contact and 404 pages.');
} finally { await server.close(); }
