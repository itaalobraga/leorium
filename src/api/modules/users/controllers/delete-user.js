import { knex } from "../../../database/knex.js";

export async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await knex("users").where("id", id).first();
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Não é possível deletar o próprio usuário" });
    }

    const userCourses = await knex("courses").where("instructor_id", id).first();
    if (userCourses) {
      return res.status(400).json({
        error: "Não é possível deletar este usuário pois ele possui cursos associados",
      });
    }

    await knex("users").where("id", id).del();

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}
