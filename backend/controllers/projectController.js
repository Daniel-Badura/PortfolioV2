import mongoose from 'mongoose';
import projects from '../data/projects.js';
import Project from '../models/projectModel.js';

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function serializeProject(project) {
  const source = projects.find(item => item.repo === project.repo && item.name.toLowerCase() === project.name.toLowerCase());
  return {
    id: project.id ?? String(project._id),
    name: project.name,
    category: project.category || source?.category || 'Web application',
    description: project.description,
    stack: Array.isArray(project.stack) ? project.stack : String(project.stack).split(/\s+/),
    image: source?.image || project.image,
    href: project.href,
    repo: project.repo,
    linkLabel: project.linkLabel || source?.linkLabel,
  };
}

export async function getProjects(req, res, next) {
  try {
    if (req.query.keyword !== undefined && (typeof req.query.keyword !== 'string' || req.query.keyword.length > 100)) {
      return res.status(400).json({ message: 'keyword must be a string of at most 100 characters' });
    }
    const keyword = (req.query.keyword || '').trim();
    if (req.app.locals.dataSource === 'mongodb') {
      const pattern = { $regex: escapeRegex(keyword), $options: 'i' };
      const data = await Project.find(keyword ? { $or: [{ name: pattern }, { description: pattern }, { stack: pattern }] } : {}).lean();
      return res.json(data.map(serializeProject));
    }
    res.json(projects.filter(project => [project.name, project.description, ...project.stack].join(' ').toLowerCase().includes(keyword.toLowerCase())));
  } catch (error) { next(error); }
}

export async function getProject(req, res, next) {
  try {
    let project;
    if (req.app.locals.dataSource === 'mongodb') {
      if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ message: 'Invalid project ID' });
      const record = await Project.findById(req.params.id).lean();
      project = record && serializeProject(record);
    } else {
      project = projects.find(item => item.id === req.params.id);
    }
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) { next(error); }
}
