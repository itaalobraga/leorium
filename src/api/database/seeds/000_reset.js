export async function seed(knex) {
  await knex("courses").del();
  await knex("categories").del();
  await knex("users").del();
}
