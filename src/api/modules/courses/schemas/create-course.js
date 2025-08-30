import z from "zod";
import { workloadPattern } from "../../../utils/check-time-units.js";

export const createCourseSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  startDate: z
    .string()
    .refine(
      (date) => new Date(date) > new Date(),
      "Data de início deve ser uma data futura"
    ),
  instructor_id: z.number().min(1, "ID do instrutor deve ser um número positivo"),
  category_id: z.number().min(1, "ID da categoria deve ser um número positivo"),
  duration: z
    .string()
    .min(1, "Duração é obrigatória")
    .refine((value) => workloadPattern(value), {
      message:
        "Duração deve estar no formato correto (ex: '2 horas', '30 minutos', '1.5 hora', '1 dia')",
    }),
  price: z.number().nonnegative("Preço deve ser um número não negativo"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres"),
  workload: z
    .string()
    .min(1, "Carga horária é obrigatória")
    .refine((value) => workloadPattern(value), {
      message:
        "Carga horária deve estar no formato correto (ex: '2 horas', '30 minutos', '1.5 hora', '1 dia')",
    }),
  level: z.enum(
    ["avancado", "intermediario", "basico", "iniciante"],
    "Nível deve ser 'avançado', 'intermediário', 'básico' ou 'iniciante'"
  ),
  spots: z.number().min(1, "Número de vagas deve ser pelo menos 1"),
  skills: z
    .array(z.string().min(2).max(100), "Habilidades devem ter entre 2 e 100 caracteres")
    .min(1, "Deve haver pelo menos uma habilidade"),
  status: z
    .enum(["ativo", "inativo"], "Status deve ser 'ativo' ou 'inativo'")
    .default("ativo"),
});
