import { Router } from "express";
import { authenticate } from "../controllers/authenticate.js";
import { checkAuthStatus, checkAuthStatusPublic } from "../controllers/check-auth.js";
import { verifyToken } from "../middlewares/verify-token.js";

const authRoutes = Router();

authRoutes.post("/", authenticate);

authRoutes.get("/", checkAuthStatusPublic);

authRoutes.get("/protected", verifyToken, checkAuthStatus);

export { authRoutes };
