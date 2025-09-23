import z from "zod";
import { knex } from "../../../database/knex.js";
import { createCourseSchema } from "../schemas/create-course.js";
import { existsInDb } from "../../../utils/exists-in-db.js";
import { paginate } from "../../../utils/paginate.js";

export class CourseController {
  async createCourse(req, res, next) {
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

  async getCourses(req, res, next) {
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

      return res.status(200).json({
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

  async getCourseById(req, res) {
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

  async updateCourse(req, res) {
    const { id: courseId } = req.params;

    const updateCourseValidation = createCourseSchema.safeParse(req.body);

    if (!updateCourseValidation.success) {
      return res
        .status(400)
        .json({
          error: z.treeifyError(updateCourseValidation.error).properties,
        });
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
      const updateData = {
        ...updateCourseValidation.data,
        updated_at: knex.fn.now(),
      };

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

  async deleteCourse(req, res) {
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
          error:
            "Acesso negado. Você não tem permissão para deletar este curso.",
        });
      }

      const courseExists = await knex("courses")
        .where({ id: courseId })
        .first();

      if (!courseExists) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      await knex("courses").where({ id: courseId }).del();

      res.status(200).json({ message: "Curso deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
      res
        .status(500)
        .json({ error: "Erro ao deletar curso. Tente novamente mais tarde." });
    }
  }
}
