import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";

export async function getCategories(req, res) {
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

    res.json({ results: categories, page: currentPage, total, limit: perPage });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}
