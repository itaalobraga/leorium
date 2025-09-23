import z from "zod";
import { createCategorySchema } from "../schemas/create-category.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";

export class CategoryController {
  async createCategory(req, res, next) {
    const categoryValidation = createCategorySchema.safeParse(req.body);

    if (!categoryValidation.success) {
      return res.status(400).json({
        error: z.treeifyError(categoryValidation.error).properties,
      });
    }

    const nameExists = await existsInDb({
      column: "name",
      table: "categories",
      value: categoryValidation.data.name,
    });

    if (nameExists) {
      return res.status(400).json({
        error: "Nome da categoria já está em uso",
      });
    }

    const category = categoryValidation.data;

    try {
      const [{ id }] = await knex("categories")
        .insert(category)
        .returning("id");

      res.status(201).json({ id, ...category });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Erro ao criar categoria",
      });
    }
  }

  async getCategories(req, res) {
    const { page, limit, search } = req.query;

    try {
      const {
        data: categories,
        pagination: { currentPage, total, perPage },
      } = await paginate({
        query: knex("categories")
          .select("id as value", "name as label")
          .modify((queryBuilder) => {
            if (search) queryBuilder.where("name", "like", `%${search}%`);
          }),
        page,
        limit,
      });

      res.json({
        results: categories,
        page: currentPage,
        total,
        limit: perPage,
      });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  }
}
