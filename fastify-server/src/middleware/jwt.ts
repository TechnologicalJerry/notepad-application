import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { UserPayload } from "../types";

export const generateAccessToken = (payload: UserPayload, options?: SignOptions): string => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as any,
    ...options,
  });
};

export const generateRefreshToken = (payload: UserPayload, options?: SignOptions): string => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as any,
    ...options,
  });
};

export const verifyAccessToken = (token: string): UserPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as UserPayload;
};

export const verifyRefreshToken = (token: string): UserPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as UserPayload;
};
