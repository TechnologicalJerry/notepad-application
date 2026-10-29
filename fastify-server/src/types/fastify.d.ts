import { UserPayload } from "./index";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserPayload;
    userId?: string;
  }
}
