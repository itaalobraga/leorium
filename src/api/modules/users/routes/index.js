import { Router } from "express";
import { createUser } from "../controllers/create-user.js";
import { getUsers } from "../controllers/get-users.js";
import { getUserById } from "../controllers/get-user-by-id.js";
import { updateUser } from "../controllers/update-user.js";
import { deleteUser } from "../controllers/delete-user.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const userRoutes = Router();

userRoutes.post("/", createUser);

userRoutes.get("/", verifyToken, getUsers);
userRoutes.get("/:id", verifyToken, getUserById);
userRoutes.put("/:id", verifyToken, updateUser);
userRoutes.delete("/:id", verifyToken, deleteUser);

export { userRoutes };
