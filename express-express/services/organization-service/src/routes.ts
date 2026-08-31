import { Express } from "express";
import {
  createFolderHandler,
  getFolderHierarchyHandler,
  getFolderByIdHandler,
  updateFolderHandler,
  deleteFolderHandler,
} from "./controllers/folder.controller";
import {
  listUserTagsHandler,
  searchHandler,
} from "./controllers/organization.controller";
import {
  createFolderSchema,
  updateFolderSchema,
  getFolderParamsSchema,
  deleteFolderSchema,
  searchQuerySchema,
} from "./schemas/organization.schema";
import { requireUser, validateResource } from "@notepad/common-core";

function routes(app: Express) {
  // Folder Hierarchy & CRUD
  app.post(
    "/api/v1/folders",
    requireUser,
    validateResource(createFolderSchema),
    createFolderHandler
  );

  app.get(
    "/api/v1/folders",
    requireUser,
    getFolderHierarchyHandler
  );

  app.get(
    "/api/v1/folders/:folderId",
    requireUser,
    validateResource(getFolderParamsSchema),
    getFolderByIdHandler
  );

  app.patch(
    "/api/v1/folders/:folderId",
    requireUser,
    validateResource(updateFolderSchema),
    updateFolderHandler
  );

  app.delete(
    "/api/v1/folders/:folderId",
    requireUser,
    validateResource(deleteFolderSchema),
    deleteFolderHandler
  );

  // Tag Management
  app.get(
    "/api/v1/tags",
    requireUser,
    listUserTagsHandler
  );

  // Unified Multi-Entity Search
  app.get(
    "/api/v1/search",
    requireUser,
    validateResource(searchQuerySchema),
    searchHandler
  );
}

export default routes;
