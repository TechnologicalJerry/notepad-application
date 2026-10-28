import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.model";
import { NotFoundError, UnauthorizedError } from "../utils/app-error";

class UserController {
  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: { user },
    });
  };

  updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { firstName, middleName, lastName } = request.body as {
      firstName?: string;
      middleName?: string;
      lastName?: string;
    };

    const updatePayload: Record<string, string> = {};
    if (firstName) updatePayload.firstName = firstName.trim();
    if (middleName !== undefined) updatePayload.middleName = middleName.trim();
    if (lastName) updatePayload.lastName = lastName.trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  };
}

export const userController = new UserController();
export default userController;
