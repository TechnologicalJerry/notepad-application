import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Note } from "../models/note.model";
import { Folder } from "../models/folder.model";
import { UnauthorizedError } from "../utils/app-error";

export class SearchController {
  search = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { q = "", type = "all", limit = "20" } = request.query as {
      q?: string;
      type?: "all" | "notes" | "folders" | "tags";
      limit?: string;
    };

    const cleanQuery = q.trim();
    if (!cleanQuery) {
      return reply.status(StatusCodes.OK).send({
        success: true,
        data: {
          query: "",
          totalMatches: 0,
          results: { notes: [], folders: [], tags: [] },
        },
      });
    }

    const maxResults = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const searchRegex = new RegExp(cleanQuery, "i");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const promises: Promise<any>[] = [];

    // Search Notes
    let matchingNotes: any[] = [];
    if (type === "all" || type === "notes") {
      promises.push(
        Note.find({
          userId: userObjectId,
          isDeleted: false,
          $or: [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }],
        })
          .populate("folderId", "name color")
          .sort({ isPinned: -1, updatedAt: -1 })
          .limit(maxResults)
          .exec()
          .then((res) => {
            matchingNotes = res;
          })
      );
    }

    // Search Folders
    let matchingFolders: any[] = [];
    if (type === "all" || type === "folders") {
      promises.push(
        Folder.find({
          userId: userObjectId,
          name: searchRegex,
        })
          .limit(maxResults)
          .exec()
          .then((res) => {
            matchingFolders = res;
          })
      );
    }

    // Search Tags
    let matchingTags: string[] = [];
    if (type === "all" || type === "tags") {
      promises.push(
        Note.distinct("tags", {
          userId: userObjectId,
          isDeleted: false,
          tags: searchRegex,
        }).then((res) => {
          matchingTags = res;
        })
      );
    }

    await Promise.all(promises);

    const totalMatches = matchingNotes.length + matchingFolders.length + matchingTags.length;

    return reply.status(StatusCodes.OK).send({
      success: true,
      data: {
        query: cleanQuery,
        type,
        totalMatches,
        results: {
          notes: matchingNotes,
          folders: matchingFolders,
          tags: matchingTags,
        },
      },
    });
  };
}

export const searchController = new SearchController();
export default searchController;
