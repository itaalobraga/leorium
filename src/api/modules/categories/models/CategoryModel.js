import { knex } from "../../../database/knex.js";

export class CategoryModel {
  async create(categoryData) {
    const [result] = await knex("categories")
      .insert(categoryData)
      .returning("*");

    return result;
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let query = knex("categories").select("id as value", "name as label");

    if (filters.search) {
      query = query.where("name", "like", `%${filters.search}%`);
    }

    const data = await query.limit(limit).offset(offset);

    const totalCount = await this.count(filters);

    return {
      data,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        total: totalCount,
      },
    };
  }

  async findById(id) {
    return await knex("categories").where({ id }).first();
  }

  async findByName(name) {
    return await knex("categories").where({ name }).first();
  }

  async update(id, categoryData) {
    const [result] = await knex("categories")
      .where({ id })
      .update(categoryData)
      .returning("*");

    return result;
  }

  async delete(id) {
    return await knex("categories").where({ id }).del();
  }

  async nameExists(name, excludeId = null) {
    let query = knex("categories").where({ name });

    if (excludeId) {
      query = query.whereNot({ id: excludeId });
    }

    const result = await query.first();
    return !!result;
  }

  async count(filters = {}) {
    let query = knex("categories");

    if (filters.search) {
      query = query.where("name", "like", `%${filters.search}%`);
    }

    const [{ count }] = await query.count("* as count");
    return parseInt(count);
  }

  async hasCourses(categoryId) {
    const result = await knex("courses")
      .where("category_id", categoryId)
      .first();
    return !!result;
  }

  async findAllSimple() {
    return await knex("categories")
      .select("id as value", "name as label")
      .orderBy("name", "asc");
  }
}
