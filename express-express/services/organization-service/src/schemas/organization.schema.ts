import { z } from "zod";

export const createFolderSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Folder name is required" })
      .trim()
      .min(1, "Folder name cannot be empty")
      .max(100, "Folder name cannot exceed 100 characters"),
    color: z.string().optional(),
    parentId: z.string().nullable().optional(),
  }),
});

export const updateFolderSchema = z.object({
  params: z.object({
    folderId: z.string({ required_error: "folderId is required" }).min(1, "folderId is required"),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Folder name cannot be empty")
      .max(100, "Folder name cannot exceed 100 characters")
      .optional(),
    color: z.string().optional(),
    parentId: z.string().nullable().optional(),
  }),
});

export const getFolderParamsSchema = z.object({
  params: z.object({
    folderId: z.string({ required_error: "folderId is required" }).min(1, "folderId is required"),
  }),
});

export const deleteFolderSchema = z.object({
  params: z.object({
    folderId: z.string({ required_error: "folderId is required" }).min(1, "folderId is required"),
  }),
  query: z.object({
    cascadeStrategy: z.enum(["unlink", "delete"]).optional().default("unlink"),
  }),
});

export const searchQuerySchema = z.object({
  query: z.object({
    q: z
      .string({ required_error: "Search query 'q' is required" })
      .trim()
      .min(1, "Search query cannot be empty"),
    type: z.enum(["all", "notes", "folders", "tags"]).optional().default("all"),
    limit: z
      .preprocess((val) => (val !== undefined ? Number(val) : 20), z.number().min(1).max(100))
      .optional()
      .default(20),
    cursor: z.string().optional(),
  }),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type GetFolderParamsInput = z.infer<typeof getFolderParamsSchema>;
export type DeleteFolderInput = z.infer<typeof deleteFolderSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
