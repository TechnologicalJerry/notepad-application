import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.utils";
import { UnauthorizedError } from "../errors/app-error";
import { correlationIdStore } from "../logging/logger";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract correlation / request ID
  const store = correlationIdStore.getStore();
  const requestId =
    store?.correlationId ||
    (req.headers["x-request-id"] as string) ||
    (req.headers["x-correlation-id"] as string) ||
    "";
  if (requestId) {
    req.requestId = requestId;
    res.locals.requestId = requestId;
  }

  const authHeader = req.headers.authorization || req.headers["authorization"] || "";
  const accessToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : "";

  if (!accessToken) {
    return next();
  }

  const { valid, decoded } = verifyAccessToken(accessToken);

  if (valid && decoded) {
    req.user = decoded;
    res.locals.user = decoded;
  }

  return next();
};

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = res.locals.user || req.user;
  if (!user) {
    throw new UnauthorizedError("Authentication is required to access this resource");
  }
  return next();
};
