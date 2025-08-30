export async function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("bio").defaultTo(null);
    table.string("avatar").defaultTo(null);
    table.enum("role", ["admin", "student", "instructor"]).notNullable();
    table.specificType("specialization", "text[]").defaultTo(null);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(null);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("users");
}
