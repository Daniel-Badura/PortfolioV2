import 'dotenv/config';
import mongoose from 'mongoose';
import projects from './data/projects.js';
import Project from './models/projectModel.js';
import connectDB from './config/db.js';

if (!process.argv.includes('--confirm')) {
  console.error('Seeder changes database records. Re-run with --confirm after backing up your database.');
  process.exitCode = 1;
} else {
  try {
    await connectDB();
    if (process.argv.includes('-d')) {
      await Project.deleteMany({});
      console.log('All project records removed.');
    } else {
      for (const project of projects) {
        const record = { ...project };
        delete record.id;
        await Project.updateOne({ name: record.name, repo: record.repo }, { $set: { ...record, stack: record.stack.join(' ') } }, { upsert: true, runValidators: true });
      }
      console.log('Project archive imported without removing other records.');
    }
  } catch {
    console.error('Seeding failed. Check database configuration.');
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
