import { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "./jwt";
import { UnauthorizedError } from "../utils/app-error";

export const requireAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authorization token is missing or malformed");
  }

  const token = authHeader.substring(7).trim();

  try {
    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    request.user = payload;
    request.userId = payload.userId;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Access token has expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
};

export const optionalAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return;
  }

  const token = authHeader.substring(7).trim();

  try {
    const payload = verifyAccessToken(token);
    request.user = payload;
    request.userId = payload.userId;
  } catch {
    // Ignore error for optional authentication
  }
};
