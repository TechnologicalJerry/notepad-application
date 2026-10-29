import { FastifyInstance } from "fastify";
import { tagController } from "../controllers/tag.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function tagRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireAuth);

  server.get(
    "/",
    {
      schema: {
        description: "List all unique tags used across active notes with counts",
        tags: ["Tags"],
        summary: "Get All Tags",
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.getTags
  );
}

export default tagRoutes;
