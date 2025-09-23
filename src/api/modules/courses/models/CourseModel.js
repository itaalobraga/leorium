import { knex } from "../../../database/knex.js";

export class CourseModel {
  async create(courseData) {
    if (courseData.skills && Array.isArray(courseData.skills)) {
      courseData.skills = JSON.stringify(courseData.skills);
    }

    const [result] = await knex("courses").insert(courseData).returning("*");

    if (result.skills) {
      try {
        result.skills = JSON.parse(result.skills);
      } catch (error) {
        result.skills = [];
      }
    }

    return result;
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const data = await knex("courses").select("*").limit(limit).offset(offset);

    const normalizedData = data.map((course) => {
      if (course.skills) {
        try {
          course.skills = JSON.parse(course.skills);
        } catch (error) {
          course.skills = [];
        }
      }
      return course;
    });

    const totalCount = await this.count();

    return {
      data: normalizedData,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        total: totalCount,
      },
    };
  }

  async findById(id) {
    const course = await knex("courses")
      .leftJoin("users", "courses.instructor_id", "users.id")
      .select("courses.*", "users.name as instructor_name")
      .where("courses.id", id)
      .first();

    if (course && course.skills) {
      try {
        course.skills = JSON.parse(course.skills);
      } catch (error) {
        course.skills = [];
      }
    }

    return course;
  }

  async update(id, courseData) {
    if (courseData.skills && Array.isArray(courseData.skills)) {
      courseData.skills = JSON.stringify(courseData.skills);
    }

    courseData.updated_at = knex.fn.now();

    const [result] = await knex("courses")
      .where({ id })
      .update(courseData)
      .returning("*");

    return result;
  }

  async delete(id) {
    return await knex("courses").where({ id }).del();
  }

  async exists(id) {
    const result = await knex("courses").where({ id }).first();
    return !!result;
  }

  async count() {
    const [{ count }] = await knex("courses").count("* as count");
    return parseInt(count);
  }

  async findByInstructor(instructorId) {
    const courses = await knex("courses").where({
      instructor_id: instructorId,
    });

    return courses.map((course) => {
      if (course.skills) {
        try {
          course.skills = JSON.parse(course.skills);
        } catch (error) {
          course.skills = [];
        }
      }
      return course;
    });
  }

  async findByCategory(categoryId) {
    const courses = await knex("courses").where({ category_id: categoryId });

    return courses.map((course) => {
      if (course.skills) {
        try {
          course.skills = JSON.parse(course.skills);
        } catch (error) {
          course.skills = [];
        }
      }
      return course;
    });
  }

  async findByStatus(status) {
    const courses = await knex("courses").where({ status });

    return courses.map((course) => {
      if (course.skills) {
        try {
          course.skills = JSON.parse(course.skills);
        } catch (error) {
          course.skills = [];
        }
      }
      return course;
    });
  }

  async findActiveCourses() {
    return await this.findByStatus("ativo");
  }

  async findUpcomingCourses() {
    const courses = await knex("courses")
      .where("startDate", ">", new Date())
      .where("status", "ativo")
      .orderBy("startDate", "asc");

    return courses.map((course) => {
      if (course.skills) {
        try {
          course.skills = JSON.parse(course.skills);
        } catch (error) {
          course.skills = [];
        }
      }
      return course;
    });
  }
}
