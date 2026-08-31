import mongoose, { FilterQuery } from "mongoose";
import NoteModel, { NoteDocument, NoteInput } from "../models/note.model";
import { NotFoundError, BadRequestError } from "@notepad/common-core";

export interface ListNotesOptions {
  isArchived?: boolean;
  isDeleted?: boolean;
  folderId?: string;
  tag?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

export async function createNote(
  userId: string,
  data: Partial<NoteInput>
): Promise<NoteDocument> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const folderObjectId = data.folderId ? new mongoose.Types.ObjectId(data.folderId) : null;

  const note = await NoteModel.create({
    ...data,
    userId: userObjectId,
    folderId: folderObjectId,
    isDeleted: false,
    deletedAt: null,
  });

  return note;
}

export async function getNoteById(
  noteId: string,
  userId: string
): Promise<NoteDocument> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new BadRequestError("Invalid note ID format");
  }

  const note = await NoteModel.findOne({
    _id: noteId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!note) {
    throw new NotFoundError("Note not found or you do not have permission to access it");
  }

  return note;
}

export async function listNotes(
  userId: string,
  options: ListNotesOptions = {}
): Promise<{ notes: NoteDocument[]; nextCursor: string | null; totalCount: number; hasMore: boolean }> {
  const {
    isArchived = false,
    isDeleted = false,
    folderId,
    tag,
    search,
    limit = 20,
    cursor,
  } = options;

  const query: FilterQuery<NoteDocument> = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted,
  };

  if (isArchived !== undefined) {
    query.isArchived = isArchived;
  }

  if (folderId !== undefined) {
    query.folderId = folderId ? new mongoose.Types.ObjectId(folderId) : null;
  }

  if (tag) {
    query.tags = tag.toLowerCase().trim();
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [{ title: searchRegex }, { content: searchRegex }];
  }

  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const effectiveLimit = Math.min(Math.max(1, limit), 100);
  const totalCount = await NoteModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted,
    ...(isArchived !== undefined ? { isArchived } : {}),
  });

  const notes = await NoteModel.find(query)
    .sort({ isPinned: -1, updatedAt: -1, _id: -1 })
    .limit(effectiveLimit + 1)
    .exec();

  const hasMore = notes.length > effectiveLimit;
  const returnedNotes = hasMore ? notes.slice(0, effectiveLimit) : notes;
  const nextCursor = hasMore && returnedNotes.length > 0
    ? returnedNotes[returnedNotes.length - 1]._id.toString()
    : null;

  return {
    notes: returnedNotes,
    nextCursor,
    totalCount,
    hasMore,
  };
}

export async function listTrashNotes(
  userId: string,
  options: { limit?: number; cursor?: string; search?: string } = {}
): Promise<{ notes: NoteDocument[]; nextCursor: string | null; totalCount: number; hasMore: boolean }> {
  const { limit = 20, cursor, search } = options;

  const query: FilterQuery<NoteDocument> = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: true,
  };

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [{ title: searchRegex }, { content: searchRegex }];
  }

  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const effectiveLimit = Math.min(Math.max(1, limit), 100);
  const totalCount = await NoteModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: true,
  });

  const notes = await NoteModel.find(query)
    .sort({ deletedAt: -1, _id: -1 })
    .limit(effectiveLimit + 1)
    .exec();

  const hasMore = notes.length > effectiveLimit;
  const returnedNotes = hasMore ? notes.slice(0, effectiveLimit) : notes;
  const nextCursor = hasMore && returnedNotes.length > 0
    ? returnedNotes[returnedNotes.length - 1]._id.toString()
    : null;

  return {
    notes: returnedNotes,
    nextCursor,
    totalCount,
    hasMore,
  };
}

export async function updateNote(
  noteId: string,
  userId: string,
  updateData: Partial<NoteInput>
): Promise<NoteDocument> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new BadRequestError("Invalid note ID format");
  }

  const updatePayload: any = { ...updateData };
  if (updateData.folderId !== undefined) {
    updatePayload.folderId = updateData.folderId
      ? new mongoose.Types.ObjectId(updateData.folderId)
      : null;
  }

  const note = await NoteModel.findOneAndUpdate(
    {
      _id: noteId,
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    },
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new NotFoundError("Note not found, is deleted, or access is unauthorized");
  }

  return note;
}

export async function softDeleteNote(
  noteId: string,
  userId: string
): Promise<NoteDocument> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new BadRequestError("Invalid note ID format");
  }

  const note = await NoteModel.findOneAndUpdate(
    {
      _id: noteId,
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        isPinned: false,
      },
    },
    { new: true }
  );

  if (!note) {
    throw new NotFoundError("Note not found or already in trash");
  }

  return note;
}

export async function restoreNote(
  noteId: string,
  userId: string
): Promise<NoteDocument> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new BadRequestError("Invalid note ID format");
  }

  const note = await NoteModel.findOneAndUpdate(
    {
      _id: noteId,
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: true,
    },
    {
      $set: {
        isDeleted: false,
        deletedAt: null,
      },
    },
    { new: true }
  );

  if (!note) {
    throw new NotFoundError("Note not found in trash or unauthorized");
  }

  return note;
}

export async function permanentDeleteNote(
  noteId: string,
  userId: string
): Promise<NoteDocument> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new BadRequestError("Invalid note ID format");
  }

  const note = await NoteModel.findOneAndDelete({
    _id: noteId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!note) {
    throw new NotFoundError("Note not found or unauthorized");
  }

  return note;
}

export async function emptyTrash(
  userId: string
): Promise<{ deletedCount: number }> {
  const result = await NoteModel.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: true,
  });

  return {
    deletedCount: result.deletedCount || 0,
  };
}
