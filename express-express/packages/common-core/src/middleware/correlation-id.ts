import { Request, Response, NextFunction } from "express";
import { correlationIdStore } from "../logging/logger";
import { randomUUID } from "crypto";

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers["x-correlation-id"] || req.headers["x-request-id"] || randomUUID()) as string;
  res.setHeader("x-correlation-id", correlationId);

  correlationIdStore.run({ correlationId }, () => {
    next();
  });
};
