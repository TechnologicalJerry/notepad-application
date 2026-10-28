import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Todo } from "../models/todo.model";
import { createTodoSchema, updateTodoSchema, todoIdParamSchema } from "../schemas/todo.schema";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/app-error";

class TodoController {
  createTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const input = createTodoSchema.parse(request.body);

    const existingTodo = await Todo.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      title: input.title,
    });

    if (existingTodo) {
      throw new ConflictError("A todo with this title already exists.");
    }

    const newTodo = await Todo.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return reply.status(StatusCodes.CREATED).send({
      success: true,
      message: "Todo created successfully!",
      todo: newTodo,
    });
  };

  getTodos = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const todos = await Todo.find({ userId: new mongoose.Types.ObjectId(userId) }).sort("-createdAt");

    return reply.status(StatusCodes.OK).send({
      success: true,
      todos,
      msg: "All Todos have been fetched!",
    });
  };

  getSingleTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = todoIdParamSchema.parse(request.params);
    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      throw new NotFoundError("Requested todo not found!");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      todo,
      msg: "Success",
    });
  };

  updateTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = todoIdParamSchema.parse(request.params);
    const input = updateTodoSchema.parse(request.body);

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      throw new NotFoundError("Requested todo not found!");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      todo: updatedTodo,
      msg: "Todo has been updated",
    });
  };

  deleteTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { id } = todoIdParamSchema.parse(request.params);
    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId });

    if (!deletedTodo) {
      throw new NotFoundError("Requested todo not found!");
    }

    return reply.status(StatusCodes.OK).send({
      success: true,
      todo: deletedTodo,
      msg: "Todo has been deleted",
    });
  };
}

export const todoController = new TodoController();
export default todoController;
