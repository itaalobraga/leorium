import { Router } from "express";
import { createCourse } from "../controllers/create-course.js";

const coursesRoutes = Router();

coursesRoutes.post("/", createCourse);

export { coursesRoutes };
