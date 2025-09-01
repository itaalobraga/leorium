# Leorium - Sistema de Gestão de Cursos

## Requisitos

- Node.js 18+
- npm

## Instalação

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd leorium
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute as migrações e (opcional) seeds:
   ```bash
   npx knex migrate:latest
   npx knex seed:run
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
   O sistema estará disponível em http://localhost:3000

## Funcionalidades

### Autenticação

- **Login:**
  - Acesse `/login.html` e faça login com email e senha.
  - O token JWT é salvo localmente e usado nas requisições.
- **Logout:**
  - Clique em "Logout" no menu para sair.

### Usuários

- **Cadastro de Usuário:**
  - Via API: `POST /api/users` com os campos obrigatórios (`name`, `email`, `password`, `role`, e `specialization` se for instrutor).
- **Listagem de Instrutores:**
  - Utilizado nos selects de curso, busca paginada via `/api/users?role=instructor&search=...&page=...`.

### Cursos

- **Listar Cursos:**
  - Página inicial (`/index.html`) lista todos os cursos disponíveis.
- **Detalhes do Curso:**
  - Clique em um curso para acessar `/detalhes.html?id=ID`.
- **Criar Curso (admin):**
  - Botão disponível apenas para admin em `/index.html`.
  - Preencha o formulário em `/criar-curso.html`.
  - Campos com busca paginada para instrutor e categoria.
- **Editar Curso (admin):**
  - Botão "Editar Curso" disponível apenas para admin em `/detalhes.html?id=ID`.
  - Redireciona para `/editar-curso.html?id=ID`.
  - Permite alterar todos os campos do curso.
- **Excluir Curso (admin):**
  - Botão "Excluir Curso" disponível apenas para admin em `/detalhes.html?id=ID`.
  - Confirmação antes de excluir.

### Categorias

- **Busca Paginada:**
  - Utilizada nos selects de curso, via `/api/categories?search=...&page=...`.

### Matrícula

- **Matricular-se em Curso:**
  - Usuário pode selecionar quantidade de vagas e se matricular (função a ser implementada).

## API

- Todas as rotas de API estão sob `/api`.
- Endpoints principais:
  - `POST /api/auth` - Login
  - `POST /api/users` - Criar usuário
  - `GET /api/users?role=instructor` - Listar instrutores
  - `GET /api/courses` - Listar cursos
  - `GET /api/courses/:id` - Detalhes do curso
  - `POST /api/courses` - Criar curso (admin)
  - `PATCH /api/courses/:id` - Editar curso (admin)
  - `DELETE /api/courses/:id` - Excluir curso (admin)
  - `GET /api/categories` - Listar/buscar categorias

## Observações

- Apenas administradores podem criar, editar ou excluir cursos.
- O sistema faz logout automático se o token expirar.
- Todos os formulários possuem validação e feedback de erro.

## Dúvidas

Entre em contato pelo email: contato@leorium.com

# Site de Cursos Online

Um site responsivo para exibição e matrícula em cursos online, desenvolvido com Node.js, Express, HTML5, CSS3 e JavaScript.

## 👤 Credenciais de Acesso

Para acessar os detalhes dos cursos, use as seguintes credenciais:

- **Usuário**: `admin`
- **Senha**: `123456`
