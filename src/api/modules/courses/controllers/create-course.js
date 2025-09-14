import z from "zod";
import { knex } from "../../../database/knex.js";
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
    const { data: course } = courseValidation;

    const normalizedSkills = JSON.stringify(course.skills || []);

    const [{ id }] = await knex("courses")
      .insert({ ...course, skills: normalizedSkills })
      .returning("id");

    return res.status(201).json({ id, ...course });
  } catch (error) {
    console.error(error);

    next();

    return res.status(500).json({
      error: "Erro ao criar curso",
    });
  }
}
