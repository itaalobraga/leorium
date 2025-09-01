import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";

export async function getUsers(req, res) {
  const { page, limit, role, search } = req.query;

  try {
    const {
      data: users,
      pagination: { currentPage, total, perPage },
    } = await paginate({
      query: knex("users")
        .select("*")
        .modify((queryBuilder) => {
          if (role) queryBuilder.where("role", role);
          if (search) queryBuilder.where("name", "like", `%${search}%`);
        }),
      page,
      limit,
    });

    // Formatar para {value, label}
    const formatted = users.map((u) => ({ value: u.id, label: u.name }));
    res.json({ results: formatted, page: currentPage, total, limit: perPage });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
