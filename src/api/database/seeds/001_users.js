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
      name: "Prof. Roberto Alves",
      email: "roberto.alves@leorium.com",
      password,
      role: "instructor",
      bio: "Desenvolvedor frontend especializado no ecossistema Vue.js",
      avatar: null,
      specialization: "Vue.js, JavaScript, Frontend",
    },
    {
      name: "Ítalo Braga",
      email: "italo@leorium.com",
      password,
      role: "student",
      bio: "Usuário aluno do sistema",
      avatar: null,
      specialization: null,
    },
  ];

  await knex("users").insert(users);
}
