import { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function userRoutes(server: FastifyInstance) {
  // Legacy user creation / registration alias
  server.post(
    "/",
    {
      schema: {
        description: "Register a new user",
        tags: ["Users"],
        summary: "Create User",
      },
    },
    authController.register
  );

  // Authenticated profile routes
  server.get(
    "/profile",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Get authenticated user profile details",
        tags: ["Users"],
        summary: "Get Profile",
        security: [{ bearerAuth: [] }],
      },
    },
    userController.getProfile
  );

  server.patch(
    "/profile",
    {
      preHandler: [requireAuth],
      schema: {
        description: "Update user profile names",
        tags: ["Users"],
        summary: "Update Profile",
        security: [{ bearerAuth: [] }],
      },
    },
    userController.updateProfile
  );
}

export default userRoutes;
