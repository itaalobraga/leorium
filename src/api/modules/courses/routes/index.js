import { Router } from "express";
import { createCourse } from "../controllers/create-course.js";
import { getCourses } from "../controllers/get-courses.js";
import { getCourseById } from "../controllers/get-course-by-id.js";
import { deleteCourse } from "../controllers/delete-course.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const coursesRoutes = Router();

coursesRoutes.post("/", verifyToken, createCourse);

coursesRoutes.get("/", verifyToken, getCourses);

coursesRoutes.get("/:id", verifyToken, getCourseById);

coursesRoutes.delete("/:id", verifyToken, deleteCourse);

export { coursesRoutes };
