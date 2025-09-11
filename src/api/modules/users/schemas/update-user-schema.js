import z from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido").min(1, "Email é obrigatório"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
    bio: z
      .string()
      .max(500, "Bio não pode ter mais de 500 caracteres")
      .nullable()
      .optional(),
    avatar: z.string().nullable().optional(),
    role: z.enum(["admin", "student", "instructor"]),
    specialization: z
      .string()
      .max(200, "Especialização não pode ter mais de 200 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "instructor" && !data.specialization) {
      ctx.addIssue({
        code: z.custom,
        message: "Especialização é obrigatória para instrutores",
        path: ["specialization"],
      });
    }
  });
