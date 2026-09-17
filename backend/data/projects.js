import { readFileSync } from 'node:fs';

export default JSON.parse(readFileSync(new URL('../../shared/projects.json', import.meta.url), 'utf8'));
