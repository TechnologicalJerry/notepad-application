import { Request, Response, NextFunction } from "express";
import { createUser, validatePassword } from "../services/userService";
import { createSession, updateSession, reIssueAccessToken } from "../services/sessionService";
import { signJwt } from "../utils/jwt.utils";
import { UnauthorizedError, ConflictError } from "@notepad/common-core";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await createUser(req.body);
    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("E11000")) {
      return next(new ConflictError("User with this email already exists"));
    }
    return next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await validatePassword(req.body);

    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    const userAgent = req.get("user-agent") || "";
    const ipAddress = req.ip || req.socket.remoteAddress || "";

    const session = await createSession(user._id, userAgent, ipAddress);

    const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || "15m";
    const refreshTokenTtl = process.env.REFRESH_TOKEN_TTL || "1y";

    const accessToken = signJwt(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        session: session._id,
      },
      "ACCESS",
      { expiresIn: accessTokenTtl }
    );

    const refreshToken = signJwt(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        session: session._id,
      },
      "REFRESH",
      { expiresIn: refreshTokenTtl }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return next(error);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = (req.get("x-refresh") || "") as string;

    if (!refreshToken) {
      return next(new UnauthorizedError("Refresh token is missing"));
    }

    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (!newAccessToken) {
      return next(new UnauthorizedError("Session has expired or is invalid"));
    }

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error: any) {
    return next(error);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = res.locals.user.session;

    await updateSession({ _id: sessionId }, { valid: false });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: null,
        refreshToken: null,
      },
    });
  } catch (error: any) {
    return next(error);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(200).json({
      success: true,
      data: res.locals.user,
    });
  } catch (error: any) {
    return next(error);
  }
}

export async function getPublicKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const base64Key = process.env.ACCESS_TOKEN_PUBLIC_KEY;
    if (!base64Key) {
      return next(new Error("Public verification key is not defined in environment"));
    }

    const publicKey = Buffer.from(base64Key, "base64").toString("ascii");

    return res.status(200).json({
      success: true,
      data: {
        publicKey,
      },
    });
  } catch (error: any) {
    return next(error);
  }
}
