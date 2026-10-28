import { FastifyReply, FastifyRequest } from "fastify";
import { authController } from "./auth.controller";

class SessionsController {
  login = async (request: FastifyRequest, reply: FastifyReply) => {
    return authController.login(request, reply);
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    return authController.logout(request, reply);
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    return authController.me(request, reply);
  };
}

export const sessionsController = new SessionsController();
export default sessionsController;
