import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  href: { type: String, required: true },
  repo: String,
  linkLabel: String,
  description: { type: String, required: true },
  stack: { type: String, required: true },
  image: { type: String, required: true },
  category: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);
