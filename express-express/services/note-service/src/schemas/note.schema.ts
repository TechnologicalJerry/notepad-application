import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().max(255, "Title must be at most 255 characters").optional(),
    content: z.string().optional(),
    folderId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    noteId: z.string({ required_error: "noteId is required" }).min(1, "noteId is required"),
  }),
  body: z.object({
    title: z.string().max(255, "Title must be at most 255 characters").optional(),
    content: z.string().optional(),
    folderId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const getNoteParamsSchema = z.object({
  params: z.object({
    noteId: z.string({ required_error: "noteId is required" }).min(1, "noteId is required"),
  }),
});

export const listNotesQuerySchema = z.object({
  query: z.object({
    isArchived: z
      .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
      .optional(),
    isDeleted: z
      .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
      .optional(),
    folderId: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    limit: z
      .preprocess((val) => (val !== undefined ? Number(val) : 20), z.number().min(1).max(100))
      .optional(),
    cursor: z.string().optional(),
  }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type GetNoteParamsInput = z.infer<typeof getNoteParamsSchema>;
export type ListNotesQueryInput = z.infer<typeof listNotesQuerySchema>;
