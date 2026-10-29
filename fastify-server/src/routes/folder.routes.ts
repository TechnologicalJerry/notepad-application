import { FastifyInstance } from "fastify";
import { folderController } from "../controllers/folder.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function folderRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireAuth);

  server.post(
    "/",
    {
      schema: {
        description: "Create a new folder for organizing notes",
        tags: ["Folders"],
        summary: "Create Folder",
        security: [{ bearerAuth: [] }],
      },
    },
    folderController.createFolder
  );

  server.get(
    "/",
    {
      schema: {
        description: "List all folders for current user with note counts",
        tags: ["Folders"],
        summary: "List Folders",
        security: [{ bearerAuth: [] }],
      },
    },
    folderController.getFolders
  );

  server.get(
    "/:id",
    {
      schema: {
        description: "Get folder details, subfolders, and note count",
        tags: ["Folders"],
        summary: "Get Folder By ID",
        security: [{ bearerAuth: [] }],
      },
    },
    folderController.getFolderById
  );

  server.patch(
    "/:id",
    {
      schema: {
        description: "Update folder name, parent folder, or color",
        tags: ["Folders"],
        summary: "Update Folder",
        security: [{ bearerAuth: [] }],
      },
    },
    folderController.updateFolder
  );

  server.delete(
    "/:id",
    {
      schema: {
        description: "Delete folder and move its notes to root",
        tags: ["Folders"],
        summary: "Delete Folder",
        security: [{ bearerAuth: [] }],
      },
    },
    folderController.deleteFolder
  );
}

export default folderRoutes;
