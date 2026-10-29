import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: unknown) {
    super(message, StatusCodes.FORBIDDEN, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(message, StatusCodes.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists", details?: unknown) {
    super(message, StatusCodes.CONFLICT, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, details);
  }
}
