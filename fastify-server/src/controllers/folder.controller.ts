import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Folder } from "../models/folder.model";
import { Note } from "../models/note.model";
import {
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
} from "../schemas/folder.schema";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/app-error";

export class FolderController {
  createFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const input = createFolderSchema.parse(request.body);

    if (input.parentId) {
      const parentFolder = await Folder.findOne({ _id: input.parentId, userId });
      if (!parentFolder) {
        throw new NotFoundError("Parent folder not found");
      }
    }

    const folder = await Folder.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      parentId: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null,
    });

    return reply.status(StatusCodes.CREATED).send({
      success: true,
      message: "Folder created successfully",
      data: { folder },
    });
  };

  getFolders = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch all folders for user
    const folders = await Folder.find({ userId: userObjectId }).sort({ name: 1 }).lean();

    // Aggregate note counts per folder
    const noteCounts = await Note.aggregate([
      {
        $match: {
          userId: userObjectId,
          isDeleted: false,
          folderId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$folderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(noteCounts.map((nc) => [nc._id.toString(), nc.count]));

    const foldersWithCounts = folders.map((f) => ({
      ...f,
      noteCount: countMap.get(f._id.toString()) || 0,
    }));

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: {
        folders: foldersWithCounts,
      },
    });
  };

  getFolderById = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = folderIdParamSchema.parse(request.params);

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    const [subFolders, noteCount] = await Promise.all([
      Folder.find({ parentId: id, userId }).sort({ name: 1 }),
      Note.countDocuments({ folderId: id, userId, isDeleted: false }),
    ]);

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: {
        folder,
        subFolders,
        noteCount,
      },
    });
  };

  updateFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = folderIdParamSchema.parse(request.params);
    const input = updateFolderSchema.parse(request.body);

    // Prevent cycle: folder cannot have itself as parent
    if (input.parentId === id) {
      throw new BadRequestError("A folder cannot be its own parent");
    }

    if (input.parentId) {
      const parentFolder = await Folder.findOne({ _id: input.parentId, userId });
      if (!parentFolder) {
        throw new NotFoundError("Target parent folder not found");
      }
    }

    const updatePayload: Record<string, any> = { ...input };
    if (input.parentId !== undefined) {
      updatePayload.parentId = input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null;
    }

    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedFolder) {
      throw new NotFoundError("Folder not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Folder updated successfully",
      data: { folder: updatedFolder },
    });
  };

  deleteFolder = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = folderIdParamSchema.parse(request.params);

    const folder = await Folder.findOneAndDelete({ _id: id, userId });
    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    // Unassign notes in this folder (move to root) and reparent subfolders to root
    await Promise.all([
      Note.updateMany({ folderId: id, userId }, { $set: { folderId: null } }),
      Folder.updateMany({ parentId: id, userId }, { $set: { parentId: null } }),
    ]);

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Folder deleted successfully. Associated notes moved to root.",
    });
  };
}

export const folderController = new FolderController();
export default folderController;
