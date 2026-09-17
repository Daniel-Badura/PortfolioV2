import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const directory = fileURLToPath(new URL('../frontend/public/images/', import.meta.url));
const projects = JSON.parse(await readFile(new URL('../shared/projects.json', import.meta.url), 'utf8'));
for (const project of projects) {
  const name = project.image.split('/').pop().replace('.webp', '');
  for (const width of [360, 540, 720]) {
    const suffix = width === 720 ? '' : '-' + width;
    const result = await sharp(directory + name + '.jpg').resize(width, Math.round(width * 5 / 8), { fit: 'cover', position: 'top', withoutEnlargement: true }).webp({ quality: 80 }).toFile(directory + name + suffix + '.webp');
    console.log(name + suffix + ': ' + result.size + ' bytes');
  }
}
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f8f9f5"/><rect x="80" y="80" width="58" height="58" fill="#202824"/><text x="88" y="121" font-family="monospace" font-size="35" fill="#f8f9f5">db</text><path d="M80 460H1120" stroke="#d6dcd3"/><text x="80" y="235" font-family="sans-serif" font-size="22" fill="#256347">DEVOPS / PLATFORM ENGINEER</text><text x="75" y="340" font-family="sans-serif" font-weight="600" font-size="86" fill="#202824">Daniel Badura.</text><text x="80" y="400" font-family="sans-serif" font-size="25" fill="#59645e">IT administration. Web development. Systems.</text><text x="80" y="530" font-family="monospace" font-size="20" fill="#59645e">github.com/Daniel-Badura</text></svg>`;
await sharp(Buffer.from(social)).png().toFile(fileURLToPath(new URL('../frontend/public/social-preview.png', import.meta.url)));
