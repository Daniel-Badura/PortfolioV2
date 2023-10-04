import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
  repo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
