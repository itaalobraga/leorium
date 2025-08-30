import { knex } from "../../../database/knex.js";

export async function deleteCourse(req, res) {
  const { id: courseId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId é obrigatório" });
  }

  try {
    const isUserAdmin = await knex("users")
      .where({ id: userId })
      .andWhere({ role: "admin" })
      .first();

    if (!isUserAdmin) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para deletar este curso.",
      });
    }

    const courseExists = await knex("courses").where({ id: courseId }).first();

    if (!courseExists) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    await knex("courses").where({ id: courseId }).del();

    res.status(200).json({ message: "Curso deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar curso:", error);
    res.status(500).json({ error: "Erro ao deletar curso. Tente novamente mais tarde." });
  }
}
