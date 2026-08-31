import { Request, Response, NextFunction } from "express";
import {
  createNote,
  getNoteById,
  listNotes,
  listTrashNotes,
  updateNote,
  softDeleteNote,
  restoreNote,
  permanentDeleteNote,
  emptyTrash,
} from "../services/note.service";
import { UnauthorizedError } from "@notepad/common-core";

function getUserIdFromRequest(req: Request, res: Response): string {
  const user = req.user || res.locals.user;
  const userId = user?._id || user?.id;
  if (!userId) {
    throw new UnauthorizedError("Authentication is required to perform this action");
  }
  return userId.toString();
}

export async function createNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const note = await createNote(userId, req.body);
    return res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listNotesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const result = await listNotes(userId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result.notes,
      meta: {
        nextCursor: result.nextCursor,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTrashNotesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const result = await listTrashNotes(userId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result.notes,
      meta: {
        nextCursor: result.nextCursor,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNoteByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const note = await getNoteById(req.params.noteId, userId);
    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const note = await updateNote(req.params.noteId, userId, req.body);
    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function softDeleteNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const note = await softDeleteNote(req.params.noteId, userId);
    return res.status(200).json({
      success: true,
      message: "Note moved to trash",
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function restoreNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const note = await restoreNote(req.params.noteId, userId);
    return res.status(200).json({
      success: true,
      message: "Note restored successfully",
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function permanentDeleteNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    await permanentDeleteNote(req.params.noteId, userId);
    return res.status(200).json({
      success: true,
      message: "Note permanently deleted",
    });
  } catch (error) {
    return next(error);
  }
}

export async function emptyTrashHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const result = await emptyTrash(userId);
    return res.status(200).json({
      success: true,
      message: `Trash emptied (${result.deletedCount} notes permanently deleted)`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
