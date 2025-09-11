import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";

export async function getUsers(req, res) {
  const { page, limit, role, search, format } = req.query;

  try {
    const { data: users, pagination } = await paginate({
      query: knex("users")
        .select(
          "id",
          "name",
          "email",
          "role",
          "bio",
          "avatar",
          "specialization",
          "created_at"
        )
        .modify((queryBuilder) => {
          if (role) queryBuilder.where("role", role);
          if (search) {
            queryBuilder.where((builder) => {
              builder
                .where("name", "like", `%${search}%`)
                .orWhere("email", "like", `%${search}%`);
            });
          }
        })
        .orderBy("created_at", "desc"),
      page,
      limit,
    });

    if (format === "select") {
      const formatted = users.map((u) => ({ value: u.id, label: u.name }));
      res.json({
        results: formatted,
        page: pagination.currentPage,
        total: pagination.total,
        limit: pagination.perPage,
      });
    } else {
      res.json({ data: users, pagination });
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
