import express from "express";
import { getProjects, getProject } from "../controllers/projectController.js";

const router = express.Router();

router.route("/").get(getProjects);
router.route("/:id").get(getProject);

export default router;
