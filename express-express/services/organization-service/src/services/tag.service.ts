import { serviceClient, createLogger } from "@notepad/common-core";

const logger = createLogger("organization-tag-service");

export interface TagCount {
  tag: string;
  count: number;
}

export async function listUserTags(
  userId: string,
  authToken?: string
): Promise<{ tags: TagCount[]; totalUniqueTags: number }> {
  const noteServiceUrl = process.env.NOTE_SERVICE_URL || "http://localhost:5020";
  const url = `${noteServiceUrl.replace(/\/$/, "")}/api/v1/notes?limit=100`;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["authorization"] = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
  }

  const tagCounts: Map<string, number> = new Map();

  try {
    const notesData = await serviceClient.get<any[]>(url, { headers });

    if (Array.isArray(notesData)) {
      for (const note of notesData) {
        if (Array.isArray(note.tags)) {
          for (const tag of note.tags) {
            if (typeof tag === "string" && tag.trim()) {
              const cleanTag = tag.toLowerCase().trim();
              tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
            }
          }
        }
      }
    }
  } catch (error: any) {
    logger.warn(`Could not aggregate tags from Note Service: ${error.message}`);
  }

  const tagList: TagCount[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    tags: tagList,
    totalUniqueTags: tagList.length,
  };
}
