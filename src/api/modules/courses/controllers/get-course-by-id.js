import { knex } from "../../../database/knex.js";

export async function getCourseById(req, res) {
  const { id } = req.params;

  try {
    const course = await knex("courses")
      .leftJoin("users", "courses.instructor_id", "users.id")
      .select("courses.*", "users.name as instructor_name")
      .where("courses.id", id)
      .first();

    if (!course) {
      return res.status(404).json({
        error: "Curso não encontrado",
      });
    }

    let normalizedSkills;
    try {
      normalizedSkills = JSON.parse(course.skills);
    } catch {
      normalizedSkills = Array.isArray(course.skills) ? course.skills : [];
    }

    const processedCourse = {
      ...course,
      skills: normalizedSkills,
    };

    return res.status(200).json(processedCourse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao buscar curso",
    });
  }
}
