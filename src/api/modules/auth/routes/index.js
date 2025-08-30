import { Router } from "express";
import { authenticate } from "../controllers/authenticate.js";

const authRoutes = Router();

authRoutes.post("/", authenticate);

export { authRoutes };
