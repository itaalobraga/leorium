import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leorium API",
      version: "1.0.0",
      description: "API para gerenciamento de cursos e usuários.",
      contact: {
        name: "Ítalo Braga",
        email: "italo@unoeste.edu.br",
      },
    },
    servers: [
      {
        url: "http://localhost:3030/api/",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT no formato: Bearer <seu-token>",
        },
      },
      schemas: {
        Course: {
          type: "object",
          required: [
            "name",
            "startDate",
            "instructor_id",
            "category_id",
            "duration",
            "price",
            "description",
            "workload",
            "level",
            "spots",
            "skills",
          ],
          properties: {
            id: {
              type: "integer",
              description: "ID único do curso",
            },
            name: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              description: "Nome do curso",
            },
            startDate: {
              type: "string",
              format: "date",
              description: "Data de início do curso (formato ISO)",
            },
            instructor_id: {
              type: "integer",
              description: "ID do instrutor responsável",
            },
            instructor_name: {
              type: "string",
              description: "Nome do instrutor (retornado na consulta)",
            },
            category_id: {
              type: "integer",
              description: "ID da categoria do curso",
            },
            duration: {
              type: "string",
              description: 'Duração do curso (ex: "2 horas", "30 minutos")',
            },
            price: {
              type: "number",
              minimum: 0,
              description: "Preço do curso",
            },
            description: {
              type: "string",
              maxLength: 500,
              description: "Descrição do curso",
            },
            workload: {
              type: "string",
              description:
                'Carga horária do curso (ex: "2 horas", "30 minutos")',
            },
            level: {
              type: "string",
              enum: ["avancado", "intermediario", "basico", "iniciante"],
              description: "Nível do curso",
            },
            spots: {
              type: "integer",
              minimum: 1,
              description: "Número de vagas disponíveis",
            },
            skills: {
              type: "array",
              items: {
                type: "string",
                minLength: 2,
                maxLength: 100,
              },
              description: "Lista de habilidades que serão desenvolvidas",
            },
            status: {
              type: "string",
              enum: ["ativo", "inativo"],
              default: "ativo",
              description: "Status do curso",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Data da última atualização",
            },
          },
        },
        CourseCreate: {
          type: "object",
          required: [
            "name",
            "startDate",
            "instructor_id",
            "category_id",
            "duration",
            "price",
            "description",
            "workload",
            "level",
            "spots",
            "skills",
          ],
          properties: {
            name: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              example: "React Avançado",
            },
            startDate: {
              type: "string",
              format: "date",
              example: "2025-12-31",
            },
            instructor_id: {
              type: "integer",
              example: 1,
            },
            category_id: {
              type: "integer",
              example: 1,
            },
            duration: {
              type: "string",
              example: "40 horas",
            },
            price: {
              type: "number",
              example: 299.9,
            },
            description: {
              type: "string",
              maxLength: 500,
              example:
                "Curso completo de React com hooks, context e performance",
            },
            workload: {
              type: "string",
              example: "40 horas",
            },
            level: {
              type: "string",
              enum: ["avancado", "intermediario", "basico", "iniciante"],
              example: "avancado",
            },
            spots: {
              type: "integer",
              minimum: 1,
              example: 30,
            },
            skills: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["React", "Hooks", "Context API", "Performance"],
            },
            status: {
              type: "string",
              enum: ["ativo", "inativo"],
              default: "ativo",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensagem de erro",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: {
              type: "object",
              description: "Detalhes dos erros de validação",
            },
          },
        },
        PaginatedCourses: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Course",
              },
            },
            page: {
              type: "integer",
              description: "Página atual",
            },
            total: {
              type: "integer",
              description: "Total de registros",
            },
            limit: {
              type: "integer",
              description: "Registros por página",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/auth": {
        post: {
          summary: "Fazer login e obter token JWT",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "admin@leorium.com",
                    },
                    password: {
                      type: "string",
                      example: "123456",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login realizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        description: "Token JWT para autenticação",
                      },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          name: { type: "string" },
                          email: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Credenciais inválidas",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        example: "Email e/ou senha incorretos",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/courses": {
        post: {
          summary: "Criar um novo curso",
          tags: ["Courses"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CourseCreate" },
              },
            },
          },
          responses: {
            201: {
              description: "Curso criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/Course" },
                      {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
            401: {
              description: "Token de autenticação inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            500: {
              description: "Erro interno do servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        get: {
          summary: "Listar todos os cursos",
          tags: ["Courses"],
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", minimum: 1, default: 1 },
              description: "Número da página",
            },
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
              },
              description: "Número de itens por página",
            },
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Termo de busca",
            },
          ],
          responses: {
            200: {
              description: "Lista de cursos retornada com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaginatedCourses" },
                },
              },
            },
            500: {
              description: "Erro interno do servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/courses/{id}": {
        get: {
          summary: "Buscar curso por ID",
          tags: ["Courses"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID do curso",
            },
          ],
          responses: {
            200: {
              description: "Curso encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Course" },
                },
              },
            },
            401: {
              description: "Token de autenticação inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "Curso não encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            500: {
              description: "Erro interno do servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        delete: {
          summary: "Deletar curso",
          tags: ["Courses"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID do curso",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userId"],
                  properties: {
                    userId: {
                      type: "integer",
                      description: "ID do usuário que está deletando",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Curso deletado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Curso deletado com sucesso",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            401: {
              description: "Token de autenticação inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            403: {
              description: "Acesso negado - usuário não é admin",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "Curso não encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            500: {
              description: "Erro interno do servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        patch: {
          summary: "Atualizar curso",
          tags: ["Courses"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID do curso",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CourseCreate" },
              },
            },
          },
          responses: {
            200: {
              description: "Curso atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Curso atualizado com sucesso",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
            401: {
              description: "Token de autenticação inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "Curso não encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            500: {
              description: "Erro interno do servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
