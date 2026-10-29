import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        description: "Register a new user account",
        tags: ["Auth"],
        summary: "User Registration",
      },
    },
    authController.register
  );

  server.post(
    "/login",
    {
      schema: {
        description: "Authenticate user and issue access and refresh tokens",
        tags: ["Auth"],
        summary: "User Login",
      },
    },
    authController.login
  );

  server.post(
    "/refresh",
    {
      schema: {
        description: "Refresh access token using a valid refresh token",
        tags: ["Auth"],
        summary: "Refresh Token",
      },
    },
    authController.refresh
  );

  server.post(
    "/logout",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Logout and revoke user sessions",
        tags: ["Auth"],
        summary: "User Logout",
        security: [{ bearerAuth: [] }],
      },
    },
    authController.logout
  );

  server.get(
    "/me",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Get authenticated user profile",
        tags: ["Auth"],
        summary: "Get Current User Profile",
        security: [{ bearerAuth: [] }],
      },
    },
    authController.me
  );
}

export default authRoutes;
