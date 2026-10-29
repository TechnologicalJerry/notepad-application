import { FastifyInstance } from "fastify";
import { sessionsController } from "../controllers/sessions.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function sessionsRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      schema: {
        description: "Login user session",
        tags: ["Sessions"],
        summary: "Create Session (Login)",
      },
    },
    sessionsController.login
  );

  server.delete(
    "/",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Logout user session",
        tags: ["Sessions"],
        summary: "Delete Session (Logout)",
        security: [{ bearerAuth: [] }],
      },
    },
    sessionsController.logout
  );

  server.get(
    "/me",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Get session user details",
        tags: ["Sessions"],
        summary: "Current Session User",
        security: [{ bearerAuth: [] }],
      },
    },
    sessionsController.me
  );
}

export default sessionsRoutes;
