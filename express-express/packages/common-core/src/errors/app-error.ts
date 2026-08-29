export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errors: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", errors: any = null) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", errors: any = null) {
    super(message, 409, errors);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = "Unprocessable Entity", errors: any = null) {
    super(message, 422, errors);
  }
}
