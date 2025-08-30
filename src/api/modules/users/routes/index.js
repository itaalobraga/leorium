import { Router } from "express";
import { createUser } from "../controllers/create-user.js";

const userRoutes = Router();

userRoutes.post("/", createUser);

export { userRoutes };
