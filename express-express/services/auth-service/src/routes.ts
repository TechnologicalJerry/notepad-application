import { Express } from "express";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  getPublicKeyHandler,
} from "./controllers/auth.controller";
import { createUserSchema, createSessionSchema } from "./schemas/auth.schema";
import validateResource from "./middleware/validateResource";
import requireUser from "./middleware/requireUser";

function routes(app: Express) {
  // Public routes
  app.post("/api/v1/auth/register", validateResource(createUserSchema), registerHandler);
  app.post("/api/v1/auth/login", validateResource(createSessionSchema), loginHandler);
  app.post("/api/v1/auth/refresh", refreshHandler);
  app.get("/api/v1/auth/public-key", getPublicKeyHandler);

  // Authenticated routes
  app.get("/api/v1/auth/me", requireUser, meHandler);
  app.delete("/api/v1/auth/logout", requireUser, logoutHandler);
}

export default routes;
