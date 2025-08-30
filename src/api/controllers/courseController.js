import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CourseController {
  static home(req, res) {
    res.sendFile(path.join(__dirname, "..", "..", "pages", "index.html"));
  }

  static getAllCourses(req, res, database) {
    const coursesResume = database.courses
      .filter((course) => course.status === "active")
      .map((course) => ({
        id: course.id,
        name: course.name,
        startDate: course.startDate,
        duration: course.duration,
        price: course.price,
        level: course.level,
        category: course.category,
      }));
    res.json(coursesResume);
  }

  static getCourseById(req, res, database) {
    const courseId = parseInt(req.params.id);
    const course = database.courses.find(
      (c) => c.id === courseId && c.status === "active"
    );

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  }

  static getCourseDetailsPage(req, res) {
    res.sendFile(path.join(__dirname, "..", "..", "pages", "detalhes.html"));
  }

  static getCategories(req, res, database) {
    res.json(database.categories);
  }

  static getInstructors(req, res, database) {
    res.json(database.instructors);
  }
}

export default CourseController;
