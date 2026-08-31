import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validateResource = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: 400,
          details: e.errors,
        },
      });
    }
  };
};

export default validateResource;
