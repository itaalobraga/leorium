import { knex } from "../../../database/knex.js";

export async function getCourses(req, res, next) {
  const { page, limit } = req.query;

  try {
    const {
      data: courses,
      pagination: { currentPage, total, perPage },
    } = await knex("courses").paginate({
      perPage: limit || 10,
      currentPage: page || 1,
    });

    const normalizedData = courses.map((course) => ({
      ...course,
      skills: JSON.parse(course.skills),
    }));

    return res
      .status(200)
      .json({ results: normalizedData, page: currentPage, total, limit: perPage });
  } catch (error) {
    console.error(error);
    next();
    return res.status(500).json({
      error: "Erro ao buscar cursos",
    });
  }
}
