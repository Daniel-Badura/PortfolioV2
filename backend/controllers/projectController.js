import asyncHandler from "express-async-handler";
import Project from "../models/projectModel.js";

// @desc        Fetch all  projects
// @route       GET /api/projects
// @access      Public
export const getProjects = asyncHandler(async (req, res) => {
  const name = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const brand = req.query.keyword
    ? {
        brand: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const description = req.query.keyword
    ? {
        description: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const category = req.query.keyword
    ? {
        category: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const search = [
    { ...name },
    { ...brand },
    { ...description },
    { ...category },
  ];
  const projects = await Project.find({
    $or: search,
  });
  res.json(projects);
});

// @desc        Fetch single project
// @route       GET /api/projects/:id
// @access      Public
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  const projectDetails = {
    _id: project._id,
    name: project.name,
    image: project.image,
    user: project.user,
    category: project.category,
    brand: project.brand,
    description: project.description,
    rating: project.rating,
    numReviews: project.numReviews,
    featured: project.featured,
    reviews: project.reviews,
    questions: project.questions.length,
  };
  if (project) {
    res.json(projectDetails);
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});
