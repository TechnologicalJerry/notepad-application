import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.model";
import { LoginSession } from "../models/session.model";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../middleware/jwt";
import { loginSchema, registerSchema, refreshSchema } from "../schemas/auth.schema";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/app-error";

export class AuthController {
  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = registerSchema.parse(request.body);

    const existingUser = await User.findOne({
      $or: [{ email: input.email }, { userName: input.userName }],
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictError("A user with this email already exists");
      }
      throw new ConflictError("A user with this username already exists");
    }

    const user = await User.create(input);

    return reply.status(StatusCodes.CREATED).send({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const userId = user._id.toString();
    const userPayload = {
      userId,
      email: user.email,
      userName: user.userName,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const userAgent = (request.headers["user-agent"] as string) || "";
    const ipAddress = request.ip || request.socket.remoteAddress || "";

    const session = await LoginSession.create({
      userId: user._id,
      userName: user.userName,
      email: user.email,
      refreshToken,
      isValid: true,
      userAgent,
      ipAddress,
    });

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        sessionId: session._id,
        user: {
          id: user._id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = refreshSchema.parse(request.body);

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const session = await LoginSession.findOne({
      refreshToken,
      isValid: true,
    });

    if (!session) {
      throw new UnauthorizedError("Session has expired or been revoked");
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("User associated with session not found");
    }

    const userPayload = {
      userId: user._id.toString(),
      email: user.email,
      userName: user.userName,
      sessionId: session._id.toString(),
    };

    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    // Rotate refresh token
    session.refreshToken = newRefreshToken;
    await session.save();

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    const bodyRefreshToken = (request.body as { refreshToken?: string })?.refreshToken;

    if (bodyRefreshToken) {
      await LoginSession.deleteOne({ refreshToken: bodyRefreshToken });
    } else if (request.user?.userId) {
      await LoginSession.deleteMany({ userId: request.user.userId });
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Logout successful",
    });
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await User.findById(request.user.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: {
        user,
      },
    });
  };
}

export const authController = new AuthController();
export default authController;
