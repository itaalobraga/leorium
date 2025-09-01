import { Router } from "express";
import { createCategory } from "../controllers/create-category.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";
import { getCategories } from "../controllers/get-categories.js";

const categoriesRoutes = Router();

categoriesRoutes.post("/", verifyToken, createCategory);

categoriesRoutes.get("/", verifyToken, getCategories);

export { categoriesRoutes };
