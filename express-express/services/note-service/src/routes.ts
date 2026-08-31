import { Express } from "express";
import {
  createNoteHandler,
  listNotesHandler,
  listTrashNotesHandler,
  getNoteByIdHandler,
  updateNoteHandler,
  softDeleteNoteHandler,
  restoreNoteHandler,
  permanentDeleteNoteHandler,
  emptyTrashHandler,
} from "./controllers/note.controller";
import {
  createNoteSchema,
  updateNoteSchema,
  getNoteParamsSchema,
  listNotesQuerySchema,
} from "./schemas/note.schema";
import { requireUser, validateResource } from "@notepad/common-core";

function routes(app: Express) {
  // Trash endpoints (mounted before :noteId to avoid parameter collision)
  app.get(
    "/api/v1/notes/trash",
    requireUser,
    validateResource(listNotesQuerySchema),
    listTrashNotesHandler
  );

  app.delete(
    "/api/v1/notes/trash/empty",
    requireUser,
    emptyTrashHandler
  );

  // Restore endpoint (mounted before generic :noteId)
  app.patch(
    "/api/v1/notes/:noteId/restore",
    requireUser,
    validateResource(getNoteParamsSchema),
    restoreNoteHandler
  );

  // Permanent delete endpoint
  app.delete(
    "/api/v1/notes/:noteId/permanent",
    requireUser,
    validateResource(getNoteParamsSchema),
    permanentDeleteNoteHandler
  );

  // Note collection endpoints
  app.post(
    "/api/v1/notes",
    requireUser,
    validateResource(createNoteSchema),
    createNoteHandler
  );

  app.get(
    "/api/v1/notes",
    requireUser,
    validateResource(listNotesQuerySchema),
    listNotesHandler
  );

  // Single Note CRUD endpoints
  app.get(
    "/api/v1/notes/:noteId",
    requireUser,
    validateResource(getNoteParamsSchema),
    getNoteByIdHandler
  );

  app.patch(
    "/api/v1/notes/:noteId",
    requireUser,
    validateResource(updateNoteSchema),
    updateNoteHandler
  );

  app.delete(
    "/api/v1/notes/:noteId",
    requireUser,
    validateResource(getNoteParamsSchema),
    softDeleteNoteHandler
  );
}

export default routes;
