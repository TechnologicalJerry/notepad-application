import { FastifyInstance } from "fastify";
import { todoController } from "../controllers/todo.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function todoRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireAuth);

  server.post(
    "/",
    {
      schema: {
        description: "Create a new todo item",
        tags: ["Todos"],
        summary: "Create Todo",
        security: [{ bearerAuth: [] }],
      },
    },
    todoController.createTodo
  );

  server.get(
    "/",
    {
      schema: {
        description: "Get all todos for the authenticated user",
        tags: ["Todos"],
        summary: "List Todos",
        security: [{ bearerAuth: [] }],
      },
    },
    todoController.getTodos
  );

  server.get(
    "/:id",
    {
      schema: {
        description: "Get a specific todo by ID",
        tags: ["Todos"],
        summary: "Get Todo By ID",
        security: [{ bearerAuth: [] }],
      },
    },
    todoController.getSingleTodo
  );

  server.patch(
    "/:id",
    {
      schema: {
        description: "Update a todo item by ID",
        tags: ["Todos"],
        summary: "Update Todo",
        security: [{ bearerAuth: [] }],
      },
    },
    todoController.updateTodo
  );

  server.delete(
    "/:id",
    {
      schema: {
        description: "Delete a todo item by ID",
        tags: ["Todos"],
        summary: "Delete Todo",
        security: [{ bearerAuth: [] }],
      },
    },
    todoController.deleteTodo
  );
}

export default todoRoutes;
