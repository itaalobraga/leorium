import z from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres." }),
  description: z
    .string()
    .min(2, { message: "Descrição deve ter pelo menos 2 caracteres." })
    .max(255, { message: "Descrição deve ter no máximo 255 caracteres." }),
});
