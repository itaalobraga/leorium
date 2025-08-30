import z from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido").min(1, "Email é obrigatório"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    bio: z.string().max(200, "Bio não pode ter mais de 200 caracteres").optional(),
    avatar: z.string().min(1, "URL do avatar inválida").optional(),
    role: z.enum(["admin", "student", "instructor"]),
    specialization: z
      .string()
      .max(100, "Especialização não pode ter mais de 100 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "instructor" && !data.specialization) {
      ctx.addIssue({
        code: z.custom,
        message: "Especialização é obrigatória para instrutores",
      });
    }
  });
