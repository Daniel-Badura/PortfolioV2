import data from '../../../shared/projects.json';

export interface ProjectData {
  id: string;
  name: string;
  category: string;
  description: string;
  stack: string[];
  image: string;
  href: string;
  repo?: string;
  linkLabel?: string;
}

export const bundledProjects: ProjectData[] = data;

function safeLink(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function isProject(value: unknown): value is ProjectData {
  if (!value || typeof value !== 'object') return false;
  const project = value as Record<string, unknown>;
  return ['id', 'name', 'category', 'description'].every(key => typeof project[key] === 'string')
    && Array.isArray(project.stack) && project.stack.every(item => typeof item === 'string')
    && typeof project.image === 'string' && /^\/images\/[a-zA-Z0-9._-]+$/.test(project.image)
    && (project.repo === undefined || safeLink(project.repo))
    && (project.linkLabel === undefined || typeof project.linkLabel === 'string')
    && safeLink(project.href);
}
