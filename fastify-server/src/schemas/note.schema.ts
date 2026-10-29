import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().max(255).default("Untitled Note"),
  content: z.string().default(""),
  folderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID").nullable().optional(),
  tags: z.array(z.string().trim().toLowerCase()).default([]),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  folderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID").nullable().optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const noteIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid note ID"),
});

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  folderId: z.string().optional(),
  tag: z.string().optional(),
  isPinned: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  isArchived: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
  sort: z.enum(["updatedAt", "createdAt", "title"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteIdParam = z.infer<typeof noteIdParamSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
