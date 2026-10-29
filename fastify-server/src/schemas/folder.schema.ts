import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100).trim(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid parent folder ID").nullable().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color").default("#6366f1"),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid parent folder ID").nullable().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color").optional(),
});

export const folderIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID"),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type FolderIdParam = z.infer<typeof folderIdParamSchema>;
