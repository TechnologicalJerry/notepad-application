"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoController = void 0;
const http_status_codes_1 = require("http-status-codes");
const todo_model_1 = require("../models/todo.model");
class TodoController {
    constructor() {
        this.createTodo = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { title, body, category, subCategory } = request.body;
            if (!title || !body || !category || !subCategory) {
                return reply.code(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                    msg: "Title, Body, Category, and SubCategory must be provided.",
                });
            }
            try {
                const existingTodo = yield todo_model_1.Todo.findOne({ title });
                if (existingTodo) {
                    return reply.code(http_status_codes_1.StatusCodes.CONFLICT).send({
                        msg: "A todo with this title already exists.",
                    });
                }
                const newTodo = yield todo_model_1.Todo.create({ title, body, category, subCategory });
                return reply.code(http_status_codes_1.StatusCodes.CREATED).send({
                    todo: newTodo,
                    msg: "Todo has been created!",
                });
            }
            catch (error) {
                request.log.error(error);
                return reply.code(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send({
                    msg: "Error creating todo.",
                });
            }
        });
        this.getTodos = (_request, reply) => __awaiter(this, void 0, void 0, function* () {
            const todos = yield todo_model_1.Todo.find({}).sort("-createdAt");
            if (todos.length === 0) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "Todo list is empty!" });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ todos, msg: "All Todos have been fetched!" });
        });
        this.getSingleTodo = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const todo = yield todo_model_1.Todo.findById({ _id: id });
            if (!todo) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "Requested todo not found!" });
            }
            return reply.code(http_status_codes_1.StatusCodes.OK).send({ todo, msg: "Success" });
        });
        this.updateTodo = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const payload = request.body;
            const updatedTodo = yield todo_model_1.Todo.findByIdAndUpdate({ _id: id }, payload, {
                new: true,
            });
            if (!updatedTodo) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "Requested todo not found!" });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ todo: updatedTodo, msg: "Todo has been updated" });
        });
        this.deleteTodo = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const deletedTodo = yield todo_model_1.Todo.findByIdAndDelete({ _id: id });
            if (!deletedTodo) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "Requested todo not found!" });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ todo: deletedTodo, msg: "Todo has been deleted" });
        });
    }
}
exports.todoController = new TodoController();
