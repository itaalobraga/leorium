import { createUserSchema } from "../schemas/create-user-schema.js";
import { updateUserSchema } from "../schemas/update-user-schema.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";
import z from "zod";
import bcrypt from "bcrypt";

export class UserController {
  async createUser(req, res) {
    const user = req.body;

    const userValidation = createUserSchema.safeParse(user);

    if (!userValidation.success) {
      return res.status(400).json({
        error: z.treeifyError(userValidation.error).properties,
      });
    }

    const emailExists = await existsInDb({
      table: "users",
      column: "email",
      value: user.email,
    });

    if (emailExists) {
      return res.status(400).json({
        error: "Email já está em uso",
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const { password, ...rest } = userValidation.data;

    try {
      await knex("users").insert({ ...rest, password: hashedPassword });

      res.status(201).json(rest);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Erro ao criar usuário",
      });
    }
  }

  async getUsers(req, res) {
    const { page, limit, role, search, format } = req.query;

    try {
      const { data: users, pagination } = await paginate({
        query: knex("users")
          .select(
            "id",
            "name",
            "email",
            "role",
            "bio",
            "avatar",
            "specialization",
            "created_at"
          )
          .modify((queryBuilder) => {
            if (role) queryBuilder.where("role", role);
            if (search) {
              queryBuilder.where((builder) => {
                builder
                  .where("name", "like", `%${search}%`)
                  .orWhere("email", "like", `%${search}%`);
              });
            }
          })
          .orderBy("created_at", "desc"),
        page,
        limit,
      });

      if (format === "select") {
        const formatted = users.map((u) => ({ value: u.id, label: u.name }));
        res.json({
          results: formatted,
          page: pagination.currentPage,
          total: pagination.total,
          limit: pagination.perPage,
        });
      } else {
        res.json({ data: users, pagination });
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }

  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await knex("users").select("*").where("id", id).first();

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }

  async updateUser(req, res) {
    const { id } = req.params;

    try {
      const existingUser = await knex("users").where("id", id).first();
      if (!existingUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const validatedData = updateUserSchema.parse(req.body);

      const emailExists = await knex("users")
        .where("email", validatedData.email)
        .where("id", "!=", id)
        .first();

      if (emailExists) {
        return res.status(400).json({ error: "Este email já está em uso" });
      }

      const updateData = {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        bio: validatedData.bio || null,
        avatar: validatedData.avatar || null,
        specialization:
          validatedData.role === "instructor"
            ? validatedData.specialization
            : null,
      };

      if (validatedData.password) {
        updateData.password = await bcrypt.hash(validatedData.password, 10);
      }

      await knex("users").where("id", id).update(updateData);

      const updatedUser = await knex("users")
        .select(
          "id",
          "name",
          "email",
          "role",
          "bio",
          "avatar",
          "specialization",
          "created_at"
        )
        .where("id", id)
        .first();

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  }

  async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const user = await knex("users").where("id", id).first();
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (parseInt(id) === req.user.id) {
        return res
          .status(400)
          .json({ error: "Não é possível deletar o próprio usuário" });
      }

      const userCourses = await knex("courses")
        .where("instructor_id", id)
        .first();
      if (userCourses) {
        return res.status(400).json({
          error:
            "Não é possível deletar este usuário pois ele possui cursos associados",
        });
      }

      await knex("users").where("id", id).del();

      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      const user = await knex("users")
        .select(
          "id",
          "name",
          "email",
          "role",
          "bio",
          "avatar",
          "specialization",
          "created_at"
        )
        .where("id", userId)
        .first();

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
      res.status(500).json({ error: "Erro ao buscar usuário atual" });
    }
  }
}
