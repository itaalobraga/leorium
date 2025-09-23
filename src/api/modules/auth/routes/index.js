import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/verify-token.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/", authController.authenticate);
authRoutes.get("/", verifyToken, authController.checkAuthStatus);
authRoutes.get("/public", authController.checkAuthStatusPublic);

export { authRoutes };
