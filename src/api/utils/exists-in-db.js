import { knex } from "../database/knex.js";

export async function existsInDb({ table, column, value }) {
  const valueExists = await knex(table)
    .where({ [column]: value })
    .first();

  return Boolean(valueExists);
}
