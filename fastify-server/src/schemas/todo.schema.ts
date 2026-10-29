import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  body: z.string().min(1, "Body is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  subCategory: z.string().min(1, "SubCategory is required").trim(),
  completed: z.boolean().default(false),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).trim().optional(),
  body: z.string().min(1).trim().optional(),
  category: z.string().min(1).trim().optional(),
  subCategory: z.string().min(1).trim().optional(),
  completed: z.boolean().optional(),
});

export const todoIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid todo ID"),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoIdParam = z.infer<typeof todoIdParamSchema>;
