import z from "zod";
import { updateCourseSchema } from "../schemas/update-course.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { knex } from "../../../database/knex";

export async function updateCourse(req, res) {
  const { id: courseId } = req.params;

  const updateCourseValidation = updateCourseSchema.safeParse(req.body);

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
    await knex.update("courses").set(updateCourseValidation.data).where("id", courseId);
    return res.status(200).json({ message: "Curso atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar curso" });
  }
}
