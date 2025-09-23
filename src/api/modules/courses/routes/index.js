import { Router } from "express";
import { CourseController } from "../controllers/CourseController.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const coursesRoutes = Router();
const courseController = new CourseController();

coursesRoutes.post("/", verifyToken, courseController.createCourse);

coursesRoutes.get("/", courseController.getCourses);

coursesRoutes.get("/:id", verifyToken, courseController.getCourseById);

coursesRoutes.delete("/:id", verifyToken, courseController.deleteCourse);

coursesRoutes.patch("/:id", verifyToken, courseController.updateCourse);

export { coursesRoutes };
