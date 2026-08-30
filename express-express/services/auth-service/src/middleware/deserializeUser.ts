import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../services/sessionService";

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization || "";
  const accessToken = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.substring(7)
    : "";

  const refreshToken = (req.headers["x-refresh"] || "") as string;

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt<{ id: string; email: string; name: string; isVerified: boolean; session: string }>(
    accessToken,
    "ACCESS"
  );

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
      
      const result = verifyJwt<{ id: string; email: string; name: string; isVerified: boolean; session: string }>(
        newAccessToken,
        "ACCESS"
      );

      if (result.decoded) {
        res.locals.user = result.decoded;
      }
    }
  }

  return next();
};

export default deserializeUser;
