import z from "zod";
import { createCourseSchema } from "./create-course";

const { instructor_id, category_id, ...rest } = createCourseSchema;

export const updateCourseSchema = z.object({
  ...rest,
});
