import bcrypt from "bcrypt";

export async function seed(knex) {
  const password = await bcrypt.hash("123456", 10);

  const users = [
    {
      name: "Administrador",
      email: "admin@leorium.com",
      password,
      role: "admin",
      bio: "Usuário administrador do sistema",
      avatar: null,
      specialization: null,
    },
    {
      name: "Prof. Maria Silva",
      email: "maria.silva@leorium.com",
      password,
      role: "instructor",
      bio: "Desenvolvedora frontend com mais de 8 anos de experiência",
      avatar: null,
      specialization: "JavaScript, React",
    },
    {
      name: "Prof. João Santos",
      email: "joao.santos@leorium.com",
      password,
      role: "instructor",
      bio: "Arquiteto de software especializado em aplicações React",
      avatar: null,
      specialization: "React, Redux, TypeScript",
    },
    {
      name: "Prof. Ana Costa",
      email: "ana.costa@leorium.com",
      password,
      role: "instructor",
      bio: "Designer e desenvolvedora frontend focada em UX/UI",
      avatar: null,
      specialization: "HTML, CSS, Design Responsivo",
    },
    {
      name: "Prof. Carlos Lima",
      email: "carlos.lima@leorium.com",
      password,
      role: "instructor",
      bio: "Desenvolvedor backend com expertise em Node.js e microserviços",
      specialization: "Node.js, APIs, Bancos de Dados",
    },
    {
      name: "Prof. Lucia Ferreira",
      email: "lucia.ferreira@leorium.com",
      password,
      role: "instructor",
      bio: "Cientista de dados e desenvolvedora Python full-stack",
      avatar: null,
      specialization: "Python, Django, Data Science",
    },
    {
      name: "Prof. Roberto Alves",
      email: "roberto.alves@leorium.com",
      password,
      role: "instructor",
      bio: "Desenvolvedor frontend especializado no ecossistema Vue.js",
      avatar: null,
      specialization: "Vue.js, JavaScript, Frontend",
    },
  ];

  await knex("users").insert(users);
}
