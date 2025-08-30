import { Router } from "express";
import { createCategory } from "../controllers/create-category.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const categoriesRoutes = Router();

categoriesRoutes.post("/", verifyToken, createCategory);

export { categoriesRoutes };
