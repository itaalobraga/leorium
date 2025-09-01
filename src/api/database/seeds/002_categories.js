export async function seed(knex) {
  const categories = [
    { name: "Programação", description: "Cursos de linguagens de programação" },
    { name: "Frontend", description: "Desenvolvimento de interfaces de usuário" },
    { name: "Backend", description: "Desenvolvimento de servidores e APIs" },
    { name: "Mobile", description: "Desenvolvimento de aplicações móveis" },
    { name: "Data Science", description: "Ciência de dados e análise" },
  ];

  await knex("categories").insert(categories);
}

