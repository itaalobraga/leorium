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

  await existsInDb({
    table: "users",
    column: "email",
    value: user.email,
    res,
  });

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const { password, ...rest } = userValidation.data;

  try {
    await knex("users").insert({ ...rest, password: hashedPassword });

    return res.status(201).json(rest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao criar usuário",
    });
  }
}
