import { Router } from "express";
import { userRoutes } from "../modules/users/routes/index.js";
import { authRoutes } from "../auth/routes/index.js";

const routes = Router();

routes.use("/users", userRoutes);

routes.use("/login", authRoutes);

export { routes };
