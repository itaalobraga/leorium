import { Router } from "express";
import { createCourse } from "../controllers/create-course.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";
import { getCourses } from "../controllers/get-courses.js";

const coursesRoutes = Router();

coursesRoutes.post("/", verifyToken, createCourse);

coursesRoutes.get("/", verifyToken, getCourses);

export { coursesRoutes };
