import mongoose from "mongoose";
import FolderModel, { FolderDocument } from "../models/folder.model";
import { serviceClient, createLogger } from "@notepad/common-core";
import { listUserTags, TagCount } from "./tag.service";

const logger = createLogger("organization-search-service");

export interface UnifiedSearchResults {
  query: string;
  type: "all" | "notes" | "folders" | "tags";
  totalMatches: number;
  results: {
    folders: FolderDocument[];
    notes: any[];
    tags: TagCount[];
  };
}

export async function executeSearch(
  userId: string,
  query: string,
  type: "all" | "notes" | "folders" | "tags" = "all",
  limit: number = 20,
  authToken?: string
): Promise<UnifiedSearchResults> {
  const cleanQuery = query.trim();
  const searchRegex = new RegExp(cleanQuery, "i");
  const userObjectId = new mongoose.Types.ObjectId(userId);

  let folders: FolderDocument[] = [];
  let notes: any[] = [];
  let tags: TagCount[] = [];

  const promises: Promise<void>[] = [];

  // Search Folders
  if (type === "all" || type === "folders") {
    promises.push(
      FolderModel.find({
        userId: userObjectId,
        name: searchRegex,
      })
        .limit(limit)
        .exec()
        .then((res) => {
          folders = res;
        })
        .catch((err) => {
          logger.warn(`Error searching folders: ${err.message}`);
        })
    );
  }

  // Search Notes (inter-service call)
  if (type === "all" || type === "notes") {
    const noteServiceUrl = process.env.NOTE_SERVICE_URL || "http://localhost:5020";
    const noteUrl = `${noteServiceUrl.replace(/\/$/, "")}/api/v1/notes?search=${encodeURIComponent(
      cleanQuery
    )}&limit=${limit}`;

    const headers: Record<string, string> = {};
    if (authToken) {
      headers["authorization"] = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
    }

    promises.push(
      serviceClient
        .get<any[]>(noteUrl, { headers })
        .then((res) => {
          if (Array.isArray(res)) {
            notes = res;
          }
        })
        .catch((err) => {
          logger.warn(`Error searching notes via Note Service: ${err.message}`);
        })
    );
  }

  // Search Tags
  if (type === "all" || type === "tags") {
    promises.push(
      listUserTags(userId, authToken)
        .then((res) => {
          tags = res.tags.filter((t) => t.tag.toLowerCase().includes(cleanQuery.toLowerCase()));
        })
        .catch((err) => {
          logger.warn(`Error searching tags: ${err.message}`);
        })
    );
  }

  await Promise.all(promises);

  return {
    query: cleanQuery,
    type,
    totalMatches: folders.length + notes.length + tags.length,
    results: {
      folders,
      notes,
      tags,
    },
  };
}
