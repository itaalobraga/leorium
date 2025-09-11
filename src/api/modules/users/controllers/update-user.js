import { knex } from "../../../database/knex.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import { updateUserSchema } from "../schemas/update-user-schema.js";

export async function updateUser(req, res) {
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
        validatedData.role === "instructor" ? validatedData.specialization : null,
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
