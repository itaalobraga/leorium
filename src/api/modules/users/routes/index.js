import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { verifyToken } from "../../auth/middlewares/verify-token.js";

const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/", userController.createUser);

userRoutes.get("/", verifyToken, userController.getUsers);
userRoutes.get("/:id", verifyToken, userController.getUserById);
userRoutes.put("/:id", verifyToken, userController.updateUser);
userRoutes.delete("/:id", verifyToken, userController.deleteUser);

export { userRoutes };
