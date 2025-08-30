export async function up(knex) {
  return knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.date("startDate").notNullable();
    table.string("duration").notNullable();
    table.float("price").notNullable();
    table.text("description").notNullable();
    table.string("workload").notNullable();
    table.integer("instructor_id").references("id").inTable("users").notNullable();
    table
      .enum("level", ["avancado", "intermediario", "basico", "iniciante"])
      .notNullable();
    table.integer("spots").notNullable();
    table.integer("category_id").references("id").inTable("categories").notNullable();
    table.specificType("skills", "text[]").notNullable();
    table.enum("status", ["ativo", "inativo"]).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(null);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("courses");
}
