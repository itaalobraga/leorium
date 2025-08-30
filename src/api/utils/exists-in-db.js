import { knex } from "../database/knex.js";

export async function existsInDb({ table, column, value, res }) {
  const valueExists = await knex(table)
    .where({ [column]: value })
    .first();

  if (valueExists) {
    return res.status(400).json({
      error: `${column} já está em uso`,
    });
  }
}
