import bcrypt from "bcrypt";
import pkg from "jsonwebtoken";
import { knex } from "../../../database/knex.js";

const { sign } = pkg;

export class AuthController {
  async authenticate(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email e password são obrigatórios." });
    }

    try {
      const user = await knex("users").select("*").where({ email }).first();

      if (!user) {
        return res.status(404).json({ error: "Email e/ou senha incorretos" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Email e/ou senha incorretos" });
      }

      const token = sign({ userId: user.id }, "secret-key", {
        expiresIn: "1h",
      });

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);

      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  checkAuthStatus(req, res) {
    return res.status(200).json({
      authenticated: true,
      user: req.user,
    });
  }

  checkAuthStatusPublic(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(200).json({
        authenticated: false,
      });
    }

    return res.status(200).json({
      authenticated: true,
    });
  }
}
