import { FastifyInstance } from "fastify";
import { noteController } from "../controllers/note.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function noteRoutes(server: FastifyInstance) {
  // All note routes require authentication
  server.addHook("preHandler", requireAuth);

  // Trash endpoints (must precede /:id)
  server.get(
    "/trash",
    {
      schema: {
        description: "List all notes currently in trash",
        tags: ["Notes"],
        summary: "Get Trashed Notes",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.getTrashNotes
  );

  server.delete(
    "/trash/empty",
    {
      schema: {
        description: "Permanently delete all notes in trash",
        tags: ["Notes"],
        summary: "Empty Trash",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.emptyTrash
  );

  server.patch(
    "/:id/restore",
    {
      schema: {
        description: "Restore a soft-deleted note from trash",
        tags: ["Notes"],
        summary: "Restore Note",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.restoreNote
  );

  server.delete(
    "/:id/permanent",
    {
      schema: {
        description: "Permanently delete a note by ID",
        tags: ["Notes"],
        summary: "Permanent Delete Note",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.permanentDeleteNote
  );

  // Primary Note CRUD
  server.post(
    "/",
    {
      schema: {
        description: "Create a new note",
        tags: ["Notes"],
        summary: "Create Note",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.createNote
  );

  server.get(
    "/",
    {
      schema: {
        description: "List notes with pagination, sorting, and filtering by folder, tag, or status",
        tags: ["Notes"],
        summary: "List Notes",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.getNotes
  );

  server.get(
    "/:id",
    {
      schema: {
        description: "Get single note by ID",
        tags: ["Notes"],
        summary: "Get Note By ID",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.getNoteById
  );

  server.patch(
    "/:id",
    {
      schema: {
        description: "Update note properties (title, content, tags, folder, pinned, archived)",
        tags: ["Notes"],
        summary: "Update Note",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.updateNote
  );

  server.delete(
    "/:id",
    {
      schema: {
        description: "Move note to trash (soft delete)",
        tags: ["Notes"],
        summary: "Soft Delete Note",
        security: [{ bearerAuth: [] }],
      },
    },
    noteController.softDeleteNote
  );
}

export default noteRoutes;
