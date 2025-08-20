class EnrollmentController {
  static async enrollInCourse(req, res, database, saveDatabase) {
    const { courseId, quantity } = req.body;
    const userId = req.session.userId;

    const course = database.courses.find(
      (c) => c.id === parseInt(courseId) && c.status === "active"
    );

    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    if (course.spots < quantity) {
      return res.status(400).json({ error: "Vagas insuficientes" });
    }

    const newEnrollment = {
      id: database.enrollments.length + 1,
      userId: userId,
      courseId: parseInt(courseId),
      enrollmentDate: new Date().toISOString().split("T")[0],
      quantity: parseInt(quantity),
      totalValue: course.price * quantity,
      status: "active",
    };

    database.enrollments.push(newEnrollment);
    course.spots -= quantity;

    if (saveDatabase(database)) {
      res.json({
        success: true,
        enrollment: newEnrollment,
        message: "Matrícula realizada com sucesso!",
      });
    } else {
      res.status(500).json({ error: "Erro ao salvar matrícula" });
    }
  }
}

export default EnrollmentController;
