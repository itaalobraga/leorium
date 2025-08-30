export async function up(knex) {
  return knex.schema.createTable("categories", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(null);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("categories");
}
