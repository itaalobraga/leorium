import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import { routes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3030;

app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "pages")));
app.use("/scripts", express.static(path.join(__dirname, "..", "scripts")));
app.use("/styles", express.static(path.join(__dirname, "..", "styles")));
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "login.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
