function mapLevel(label) {
  const norm = (label || "").toLowerCase();
  if (norm.includes("avanç")) return "avancado";
  if (norm.includes("intermedi")) return "intermediario";
  if (norm.includes("básic") || norm.includes("basic")) return "basico";
  return "iniciante";
}

export async function seed(knex) {
  const users = await knex("users").select("id", "name", "role");
  const categories = await knex("categories").select("id", "name");

  const findInstructorId = (name) =>
    users.find((u) => u.role === "instructor" && u.name === name)?.id;
  const findCategoryId = (name) => categories.find((c) => c.name === name)?.id;

  const rawCourses = [
    {
      name: "JavaScript Fundamentals",
      startDate: "2025-09-01",
      duration: "40 horas",
      price: 299.99,
      description:
        "Aprenda os fundamentos do JavaScript, desde variáveis e funções até manipulação do DOM e programação assíncrona.",
      workload: "40 horas",
      instructor: "Prof. Maria Silva",
      level: "Iniciante",
      spots: 25,
      category: "Programação",
      skills: ["JavaScript", "HTML", "CSS", "DOM"],
      status: "active",
    },
    {
      name: "React.js Avançado",
      startDate: "2025-09-15",
      duration: "60 horas",
      price: 599.99,
      description:
        "Domine o React.js com hooks, context API, Redux e desenvolvimento de aplicações complexas.",
      workload: "60 horas",
      instructor: "Prof. João Santos",
      level: "Avançado",
      spots: 15,
      category: "Programação",
      skills: ["React", "Redux", "JavaScript", "TypeScript"],
      status: "active",
    },
    {
      name: "HTML5 & CSS3",
      startDate: "2025-08-20",
      duration: "30 horas",
      price: 199.99,
      description:
        "Crie layouts responsivos e modernos utilizando HTML5 semântico e CSS3 avançado.",
      workload: "30 horas",
      instructor: "Prof. Ana Costa",
      level: "Iniciante",
      spots: 30,
      category: "Frontend",
      skills: ["HTML5", "CSS3", "Flexbox", "Grid"],
      status: "active",
    },
    {
      name: "Node.js Backend",
      startDate: "2025-10-01",
      duration: "50 horas",
      price: 449.99,
      description:
        "Desenvolva APIs REST robustas com Node.js, Express e integração com bancos de dados.",
      workload: "50 horas",
      instructor: "Prof. Carlos Lima",
      level: "Intermediário",
      spots: 20,
      category: "Backend",
      skills: ["Node.js", "Express", "MongoDB", "API REST"],
      status: "active",
    },
    {
      name: "Python para Web",
      startDate: "2025-10-15",
      duration: "45 horas",
      price: 379.99,
      description:
        "Construa aplicações web completas com Python, Django e integração com APIs.",
      workload: "45 horas",
      instructor: "Prof. Lucia Ferreira",
      level: "Intermediário",
      spots: 18,
      category: "Backend",
      skills: ["Python", "Django", "PostgreSQL", "APIs"],
      status: "active",
    },
    {
      name: "Vue.js Completo",
      startDate: "2025-11-01",
      duration: "55 horas",
      price: 519.99,
      description:
        "Aprenda Vue.js do básico ao avançado, incluindo Vuex, Vue Router e composição de componentes.",
      workload: "55 horas",
      instructor: "Prof. Roberto Alves",
      level: "Intermediário",
      spots: 22,
      category: "Frontend",
      skills: ["Vue.js", "Vuex", "Vue Router", "JavaScript"],
      status: "active",
    },
  ];

  const courses = rawCourses
    .map((c) => ({
      name: c.name,
      startDate: c.startDate,
      duration: c.duration,
      price: c.price,
      description: c.description,
      workload: c.workload,
      instructor_id: findInstructorId(c.instructor),
      level: mapLevel(c.level),
      spots: c.spots,
      category_id: findCategoryId(c.category),
      skills: JSON.stringify(c.skills || []),
      status: c.status === "active" ? "ativo" : "inativo",
    }))
    .filter((c) => c.instructor_id && c.category_id);

  await knex("courses").insert(courses);
}
