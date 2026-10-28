import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { env } from "../config/env.config";

export const errorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  // 1. Handled AppError instances
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.statusCode,
        message: error.message,
        details: error.details || null,
      },
    });
  }

  // 2. Zod Validation Errors
  if (error instanceof ZodError) {
    return reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
      success: false,
      error: {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "Validation failed",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

  // 3. Fastify built-in schema validation errors
  if ("validation" in error && error.validation) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: error.message || "Request validation failed",
        details: error.validation,
      },
    });
  }

  // 4. Mongoose Duplicate Key Error (E11000)
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue || {})[0] || "field";
    return reply.status(StatusCodes.CONFLICT).send({
      success: false,
      error: {
        code: StatusCodes.CONFLICT,
        message: `A record with this ${field} already exists.`,
        details: (error as any).keyValue,
      },
    });
  }

  // 5. Mongoose CastError (invalid ObjectId)
  if ((error as any).name === "CastError") {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: `Invalid ID format for path '${(error as any).path}'`,
      },
    });
  }

  // 6. Mongoose ValidationError
  if ((error as any).name === "ValidationError") {
    const details = Object.values((error as any).errors || {}).map((e: any) => ({
      path: e.path,
      message: e.message,
    }));
    return reply.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: "Database validation error",
        details,
      },
    });
  }

  // 7. General unexpected errors
  const statusCode = (error as any).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const isProd = env.NODE_ENV === "production";

  return reply.status(statusCode).send({
    success: false,
    error: {
      code: statusCode,
      message: isProd ? "Internal server error" : error.message || "An unexpected error occurred",
      ...(isProd ? {} : { stack: error.stack }),
    },
  });
};
