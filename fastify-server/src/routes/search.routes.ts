import { FastifyInstance } from "fastify";
import { searchController } from "../controllers/search.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function searchRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireAuth);

  server.get(
    "/",
    {
      schema: {
        description: "Unified search across notes, folders, and tags",
        tags: ["Search"],
        summary: "Unified Search",
        security: [{ bearerAuth: [] }],
      },
    },
    searchController.search
  );
}

export default searchRoutes;
