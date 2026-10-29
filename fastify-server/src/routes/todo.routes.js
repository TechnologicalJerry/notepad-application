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
const todo_controller_1 = require("../controllers/todo.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
function todoRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.addHook("preHandler", auth_middleware_1.requireAuth);
        server.post("/", todo_controller_1.todoController.createTodo);
        server.get("/", todo_controller_1.todoController.getTodos);
        server.get("/:id", todo_controller_1.todoController.getSingleTodo);
        server.patch("/:id", todo_controller_1.todoController.updateTodo);
        server.delete("/:id", todo_controller_1.todoController.deleteTodo);
    });
}
exports.default = todoRoutes;
