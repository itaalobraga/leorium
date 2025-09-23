import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const categoriesRoutes = Router();
const categoryController = new CategoryController();

categoriesRoutes.post("/", verifyToken, categoryController.createCategory);

categoriesRoutes.get("/", verifyToken, categoryController.getCategories);

export { categoriesRoutes };
