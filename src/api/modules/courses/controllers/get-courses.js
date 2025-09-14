import { knex } from "../../../database/knex.js";
import { paginate } from "../../../utils/paginate.js";

export async function getCourses(req, res, next) {
  const { page, limit } = req.query;

  try {
    const query = knex("courses").select("*");

    const {
      data: courses,
      pagination: { currentPage, total, perPage },
    } = await paginate({ query, limit, page });

    const normalizedData = courses.map((course) => ({
      ...course,
      skills: JSON.parse(course.skills),
    }));

    return res
      .status(200)
      .json({
        results: normalizedData,
        page: currentPage,
        total,
        limit: perPage,
      });
  } catch (error) {
    console.error(error);
    next();
    return res.status(500).json({
      error: "Erro ao buscar cursos",
    });
  }
}
