import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Note } from "../models/note.model";
import { Folder } from "../models/folder.model";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
  listNotesQuerySchema,
} from "../schemas/note.schema";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/app-error";

export class NoteController {
  createNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const input = createNoteSchema.parse(request.body);

    // Validate folder ownership if folderId is provided
    if (input.folderId) {
      const folder = await Folder.findOne({ _id: input.folderId, userId });
      if (!folder) {
        throw new NotFoundError("Folder not found or does not belong to you");
      }
    }

    const note = await Note.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      folderId: input.folderId ? new mongoose.Types.ObjectId(input.folderId) : null,
    });

    return reply.status(StatusCodes.CREATED).send({
      success: true,
      message: "Note created successfully",
      data: { note },
    });
  };

  getNotes = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const query = listNotesQuerySchema.parse(request.query);
    const filter: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    if (query.folderId) {
      filter.folderId = query.folderId === "root" || query.folderId === "null"
        ? null
        : new mongoose.Types.ObjectId(query.folderId);
    }

    if (query.tag) {
      filter.tags = query.tag.toLowerCase().trim();
    }

    if (typeof query.isPinned === "boolean") {
      filter.isPinned = query.isPinned;
    }

    if (typeof query.isArchived === "boolean") {
      filter.isArchived = query.isArchived;
    } else {
      // By default exclude archived notes unless explicitly requested
      filter.isArchived = false;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), "i");
      filter.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const sortField = query.sort;
    const sortOrder = query.order === "asc" ? 1 : -1;
    // Pinned notes always sort to the top first, then user's sort preference
    const sortOptions: Record<string, any> = { isPinned: -1, [sortField]: sortOrder };

    const [total, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .populate("folderId", "name color")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: { notes },
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  };

  getNoteById = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = noteIdParamSchema.parse(request.params);

    const note = await Note.findOne({
      _id: id,
      userId,
    }).populate("folderId", "name color");

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: { note },
    });
  };

  updateNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = noteIdParamSchema.parse(request.params);
    const input = updateNoteSchema.parse(request.body);

    if (input.folderId) {
      const folder = await Folder.findOne({ _id: input.folderId, userId });
      if (!folder) {
        throw new NotFoundError("Target folder not found");
      }
    }

    const updatePayload: Record<string, any> = { ...input };
    if (input.folderId !== undefined) {
      updatePayload.folderId = input.folderId ? new mongoose.Types.ObjectId(input.folderId) : null;
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).populate("folderId", "name color");

    if (!updatedNote) {
      throw new NotFoundError("Note not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Note updated successfully",
      data: { note: updatedNote },
    });
  };

  softDeleteNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = noteIdParamSchema.parse(request.params);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          isPinned: false, // unpin when trashed
        },
      },
      { new: true }
    );

    if (!note) {
      throw new NotFoundError("Note not found or already deleted");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Note moved to trash",
      data: { note },
    });
  };

  restoreNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = noteIdParamSchema.parse(request.params);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
      { new: true }
    );

    if (!note) {
      throw new NotFoundError("Note not found in trash");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Note restored from trash",
      data: { note },
    });
  };

  permanentDeleteNote = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = noteIdParamSchema.parse(request.params);

    const deletedNote = await Note.findOneAndDelete({ _id: id, userId });

    if (!deletedNote) {
      throw new NotFoundError("Note not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Note permanently deleted",
    });
  };

  getTrashNotes = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const query = listNotesQuerySchema.parse(request.query);
    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: true,
    };

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [total, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: { notes },
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  };

  emptyTrash = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const result = await Note.deleteMany({ userId, isDeleted: true });

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: `Trash emptied. ${result.deletedCount} note(s) permanently removed.`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  };
}

export const noteController = new NoteController();
export default noteController;
