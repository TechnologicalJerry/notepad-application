import { Request, Response, NextFunction } from "express";
import {
  createFolder,
  getFolderHierarchy,
  getFolderById,
  updateFolder,
  deleteFolder,
} from "../services/folder.service";
import { UnauthorizedError } from "@notepad/common-core";

function getUserIdFromRequest(req: Request, res: Response): string {
  const user = req.user || res.locals.user;
  const userId = user?._id || user?.id;
  if (!userId) {
    throw new UnauthorizedError("Authentication is required to perform this action");
  }
  return userId.toString();
}

export async function createFolderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const folder = await createFolder(userId, req.body);
    return res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFolderHierarchyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const result = await getFolderHierarchy(userId);
    return res.status(200).json({
      success: true,
      data: result.tree,
      meta: {
        totalCount: result.totalCount,
        flat: result.flat,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFolderByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const folder = await getFolderById(req.params.folderId, userId);
    return res.status(200).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateFolderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const folder = await updateFolder(req.params.folderId, userId, req.body);
    return res.status(200).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFolderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const strategy = (req.query.cascadeStrategy as "unlink" | "delete") || "unlink";
    const result = await deleteFolder(req.params.folderId, userId, strategy);
    return res.status(200).json({
      success: true,
      message: `Folder and ${result.deletedCount - 1} subfolders deleted successfully`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
