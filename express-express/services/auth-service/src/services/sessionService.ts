import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "../models/session.model";
import { verifyJwt, signJwt } from "../utils/jwt.utils";
import { findUser } from "./userService";

export async function createSession(userId: string, userAgent: string, ipAddress: string) {
  const session = await SessionModel.create({ user: userId, userAgent, ipAddress });
  return session;
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean();
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) {
  return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({ refreshToken }: { refreshToken: string }) {
  const { decoded } = verifyJwt<{ session: string }>(refreshToken, "REFRESH");

  if (!decoded || !decoded.session) return false;

  const session = await SessionModel.findById(decoded.session);

  if (!session || !session.valid) return false;

  const user = await findUser({ _id: session.user });

  if (!user) return false;

  const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || "15m";

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

  return accessToken;
}
