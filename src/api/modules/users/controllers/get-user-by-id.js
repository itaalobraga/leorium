import { knex } from "../../../database/knex.js";

export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await knex("users").select("*").where("id", id).first();

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}
