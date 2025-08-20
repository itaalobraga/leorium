import express from "express";
import session from "express-session";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import AuthController from "./src/controllers/authController.js";
import CourseController from "./src/controllers/courseController.js";
import EnrollmentController from "./src/controllers/enrollmentController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

function loadDatabase() {
  try {
    const dbPath = path.join(__dirname, "src", "database", "db.json");
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao carregar banco de dados:", error);
    return null;
  }
}

function saveDatabase(data) {
  try {
    const dbPath = path.join(__dirname, "src", "database", "db.json");
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erro ao salvar banco de dados:", error);
    return false;
  }
}

const database = loadDatabase();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/scripts", express.static(path.join(__dirname, "src", "scripts")));
app.use("/styles", express.static(path.join(__dirname, "src", "styles")));
app.use("/assets", express.static(path.join(__dirname, "src", "assets")));

app.use(
  session({
    secret: "curso-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

if (!database) {
  console.error("Falha ao carregar banco de dados. Servidor não pode inicializar.");
  process.exit(1);
}

const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "assets", "favicon.svg"));
});

app.get("/", (req, res) => {
  CourseController.home(req, res);
});

app.get("/login", (req, res) => {
  AuthController.login(req, res);
});

app.post("/login", (req, res) => {
  AuthController.authenticate(req, res, database, saveDatabase);
});

app.get("/logout", (req, res) => {
  AuthController.logout(req, res);
});

app.get("/api/courses", (req, res) => {
  CourseController.getAllCourses(req, res, database);
});

app.get("/api/courses/:id", requireAuth, (req, res) => {
  CourseController.getCourseById(req, res, database);
});

app.get("/course/:id", requireAuth, (req, res) => {
  CourseController.getCourseDetailsPage(req, res);
});

app.get("/api/auth", (req, res) => {
  AuthController.getAuthStatus(req, res);
});

app.get("/api/categories", (req, res) => {
  CourseController.getCategories(req, res, database);
});

app.get("/api/instructors", (req, res) => {
  CourseController.getInstructors(req, res, database);
});

app.post("/api/enrollment", requireAuth, (req, res) => {
  EnrollmentController.enrollInCourse(req, res, database, saveDatabase);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
