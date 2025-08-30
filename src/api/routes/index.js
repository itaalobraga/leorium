import { Router } from "express";
import { userRoutes } from "../modules/users/routes/index.js";
import { authRoutes } from "../modules/auth/routes/index.js";
import { categoriesRoutes } from "../modules/categories/routes/index.js";
import { coursesRoutes } from "../modules/courses/routes/index.js";

const routes = Router();

const routeMap = [
  ["/users", userRoutes],
  ["/auth", authRoutes],
  ["/categories", categoriesRoutes],
  ["/courses", coursesRoutes],
];

routeMap.forEach(([path, handler]) => {
  routes.use(path, handler);
});

export { routes };
