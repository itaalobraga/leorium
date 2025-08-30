import z from "zod";
import { knex } from "../../../database/knex.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { createCourseSchema } from "../schemas/create-course.js";

export async function createCourse(req, res, next) {
  const course = req.body;

  const courseValidation = createCourseSchema.safeParse(course);

  if (!courseValidation.success) {
    return res.status(400).json({
      error: z.treeifyError(courseValidation.error).properties,
    });
  }

  try {
    const [{ id }] = await knex("courses").insert(courseValidation.data).returning("id");

    return res.status(201).json({ id, ...courseValidation.data });
  } catch (error) {
    console.error(error);

    next();

    return res.status(500).json({
      error: "Erro ao criar curso",
    });
  }
}
