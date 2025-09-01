import { createUserSchema } from "../schemas/create-user-schema.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { knex } from "../../../database/knex.js";
import z from "zod";
import bcrypt from "bcrypt";

export async function createUser(req, res, next) {
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
