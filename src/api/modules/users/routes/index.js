import { Router } from "express";
import { createUser } from "../controllers/create-user.js";
import { getUsers } from "../controllers/get-users.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const userRoutes = Router();

userRoutes.post("/", createUser);

userRoutes.get("/", verifyToken, getUsers);

export { userRoutes };
