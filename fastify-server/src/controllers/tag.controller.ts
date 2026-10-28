import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Note } from "../models/note.model";
import { UnauthorizedError } from "../utils/app-error";

export class TagController {
  getTags = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate unique tags across non-deleted notes
    const tagAggregation = await Note.aggregate([
      {
        $match: {
          userId: userObjectId,
          isDeleted: false,
          tags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: {
        tags: tagAggregation,
        totalUniqueTags: tagAggregation.length,
      },
    });
  };
}

export const tagController = new TagController();
export default tagController;
