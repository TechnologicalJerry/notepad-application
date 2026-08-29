import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import pino from "pino";

export const createErrorHandler = (logger: pino.Logger) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      logger.warn({ err }, err.message);
      return res.status(err.statusCode).json({
        success: false,
        error: {
          message: err.message,
          code: err.statusCode,
          details: err.errors,
        },
      });
    }

    logger.error({ err }, "Unhandled internal error occurred");
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
        code: 500,
      },
    });
  };
};
