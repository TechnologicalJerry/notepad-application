import mongoose from "mongoose";
import FolderModel, { FolderDocument, FolderInput } from "../models/folder.model";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  serviceClient,
} from "@notepad/common-core";

export interface FolderNode {
  _id: string;
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: FolderNode[];
}

export async function createFolder(
  userId: string,
  data: { name: string; color?: string; parentId?: string | null }
): Promise<FolderDocument> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let parentObjectId: mongoose.Types.ObjectId | null = null;

  if (data.parentId) {
    if (!mongoose.Types.ObjectId.isValid(data.parentId)) {
      throw new BadRequestError("Invalid parent folder ID format");
    }
    parentObjectId = new mongoose.Types.ObjectId(data.parentId);
    const parentFolder = await FolderModel.findOne({ _id: parentObjectId, userId: userObjectId });
    if (!parentFolder) {
      throw new NotFoundError("Parent folder not found or unauthorized");
    }
  }

  // Check duplicate sibling folder name
  const existing = await FolderModel.findOne({
    userId: userObjectId,
    parentId: parentObjectId,
    name: data.name.trim(),
  });

  if (existing) {
    throw new ConflictError(`A folder named '${data.name.trim()}' already exists in this directory`);
  }

  const folder = await FolderModel.create({
    userId: userObjectId,
    name: data.name.trim(),
    color: data.color || "#64748b",
    parentId: parentObjectId,
  });

  return folder;
}

export async function getFolderHierarchy(
  userId: string
): Promise<{ tree: FolderNode[]; flat: FolderDocument[]; totalCount: number }> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const folders = await FolderModel.find({ userId: userObjectId }).sort({ name: 1 }).exec();

  const folderMap = new Map<string, FolderNode>();
  const tree: FolderNode[] = [];

  // Initialize node maps
  for (const folder of folders) {
    const id = folder._id.toString();
    folderMap.set(id, {
      _id: id,
      id,
      name: folder.name,
      color: folder.color,
      parentId: folder.parentId ? folder.parentId.toString() : null,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      children: [],
    });
  }

  // Build hierarchy tree
  for (const folder of folders) {
    const id = folder._id.toString();
    const node = folderMap.get(id)!;
    if (folder.parentId) {
      const parentNode = folderMap.get(folder.parentId.toString());
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        tree.push(node);
      }
    } else {
      tree.push(node);
    }
  }

  return {
    tree,
    flat: folders,
    totalCount: folders.length,
  };
}

export async function getFolderById(
  folderId: string,
  userId: string
): Promise<FolderDocument> {
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    throw new BadRequestError("Invalid folder ID format");
  }

  const folder = await FolderModel.findOne({
    _id: new mongoose.Types.ObjectId(folderId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!folder) {
    throw new NotFoundError("Folder not found or unauthorized");
  }

  return folder;
}

async function getAllDescendantIds(
  folderId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId[]> {
  const children = await FolderModel.find({ parentId: folderId, userId }).exec();
  let descendantIds: mongoose.Types.ObjectId[] = [];

  for (const child of children) {
    descendantIds.push(child._id as mongoose.Types.ObjectId);
    const nested = await getAllDescendantIds(child._id as mongoose.Types.ObjectId, userId);
    descendantIds = descendantIds.concat(nested);
  }

  return descendantIds;
}

export async function updateFolder(
  folderId: string,
  userId: string,
  updateData: { name?: string; color?: string; parentId?: string | null }
): Promise<FolderDocument> {
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    throw new BadRequestError("Invalid folder ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const folderObjectId = new mongoose.Types.ObjectId(folderId);

  const folder = await FolderModel.findOne({ _id: folderObjectId, userId: userObjectId });
  if (!folder) {
    throw new NotFoundError("Folder not found or unauthorized");
  }

  const newName = updateData.name !== undefined ? updateData.name.trim() : folder.name;
  let newParentId: mongoose.Types.ObjectId | null = folder.parentId;

  if (updateData.parentId !== undefined) {
    if (updateData.parentId === null) {
      newParentId = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(updateData.parentId)) {
        throw new BadRequestError("Invalid parent folder ID format");
      }
      if (updateData.parentId === folderId) {
        throw new BadRequestError("A folder cannot be its own parent");
      }

      const candidateParentObjectId = new mongoose.Types.ObjectId(updateData.parentId);
      const parentFolder = await FolderModel.findOne({ _id: candidateParentObjectId, userId: userObjectId });
      if (!parentFolder) {
        throw new NotFoundError("Target parent folder not found or unauthorized");
      }

      // Check circular references (cannot move folder into its own descendant)
      const descendantIds = await getAllDescendantIds(folderObjectId, userObjectId);
      const isDescendant = descendantIds.some((id) => id.equals(candidateParentObjectId));
      if (isDescendant) {
        throw new BadRequestError("Cannot move a folder into one of its own subfolders (circular hierarchy detected)");
      }

      newParentId = candidateParentObjectId;
    }
  }

  // Check sibling duplicate name
  const existing = await FolderModel.findOne({
    userId: userObjectId,
    parentId: newParentId,
    name: newName,
    _id: { $ne: folderObjectId },
  });

  if (existing) {
    throw new ConflictError(`A sibling folder named '${newName}' already exists in the destination folder`);
  }

  folder.name = newName;
  if (updateData.color !== undefined) {
    folder.color = updateData.color;
  }
  folder.parentId = newParentId;

  await folder.save();
  return folder;
}

export async function deleteFolder(
  folderId: string,
  userId: string,
  cascadeStrategy: "unlink" | "delete" = "unlink"
): Promise<{ deletedFolderIds: string[]; deletedCount: number }> {
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    throw new BadRequestError("Invalid folder ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const folderObjectId = new mongoose.Types.ObjectId(folderId);

  const folder = await FolderModel.findOne({ _id: folderObjectId, userId: userObjectId });
  if (!folder) {
    throw new NotFoundError("Folder not found or unauthorized");
  }

  const descendantIds = await getAllDescendantIds(folderObjectId, userObjectId);
  const allFolderObjectIds = [folderObjectId, ...descendantIds];
  const allFolderIds = allFolderObjectIds.map((id) => id.toString());

  // Delete folders
  const result = await FolderModel.deleteMany({
    _id: { $in: allFolderObjectIds },
    userId: userObjectId,
  });

  return {
    deletedFolderIds: allFolderIds,
    deletedCount: result.deletedCount || allFolderIds.length,
  };
}
