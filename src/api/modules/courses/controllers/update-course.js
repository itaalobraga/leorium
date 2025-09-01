import z from "zod";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { knex } from "../../../database/knex.js";
import { createCourseSchema } from "../schemas/create-course.js";

export async function updateCourse(req, res) {
  const { id: courseId } = req.params;

  const updateCourseValidation = createCourseSchema.safeParse(req.body);

  if (!updateCourseValidation.success) {
    return res
      .status(400)
      .json({ error: z.treeifyError(updateCourseValidation.error).properties });
  }

  const courseExists = await existsInDb({
    column: "id",
    value: courseId,
    table: "courses",
  });

  if (!courseExists) {
    return res.status(404).json({ error: "Curso não encontrado" });
  }

  try {
    const updateData = { ...updateCourseValidation.data, updated_at: knex.fn.now() };
    // skills deve ser salvo como string JSON
    if (Array.isArray(updateData.skills)) {
      updateData.skills = JSON.stringify(updateData.skills);
    }
    await knex("courses").update(updateData).where("id", courseId);
    return res.status(200).json({ message: "Curso atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar curso" });
  }
}
