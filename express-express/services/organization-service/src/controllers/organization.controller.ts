import { Request, Response, NextFunction } from "express";
import { listUserTags } from "../services/tag.service";
import { executeSearch } from "../services/search.service";
import { UnauthorizedError } from "@notepad/common-core";

function getUserIdFromRequest(req: Request, res: Response): string {
  const user = req.user || res.locals.user;
  const userId = user?._id || user?.id;
  if (!userId) {
    throw new UnauthorizedError("Authentication is required to perform this action");
  }
  return userId.toString();
}

function getAuthTokenFromRequest(req: Request): string | undefined {
  const authHeader = req.headers.authorization || req.headers["authorization"];
  return typeof authHeader === "string" ? authHeader : undefined;
}

export async function listUserTagsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const authToken = getAuthTokenFromRequest(req);
    const result = await listUserTags(userId, authToken);
    return res.status(200).json({
      success: true,
      data: result.tags,
      meta: {
        totalUniqueTags: result.totalUniqueTags,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromRequest(req, res);
    const authToken = getAuthTokenFromRequest(req);
    const { q, type = "all", limit = 20 } = req.query as any;

    const result = await executeSearch(
      userId,
      q as string,
      type as any,
      Number(limit),
      authToken
    );

    return res.status(200).json({
      success: true,
      data: result.results,
      meta: {
        query: result.query,
        type: result.type,
        totalMatches: result.totalMatches,
      },
    });
  } catch (error) {
    return next(error);
  }
}
