import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@notepad/common-core";

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  if (!user) {
    throw new UnauthorizedError("Authentication is required to access this resource");
  }
  return next();
};

export default requireUser;
