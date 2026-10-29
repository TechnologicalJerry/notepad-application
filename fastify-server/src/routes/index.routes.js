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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_routes_1 = __importDefault(require("./user.routes"));
const sessions_routes_1 = __importDefault(require("./sessions.routes"));
const todo_routes_1 = __importDefault(require("./todo.routes"));
function indexRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.register(user_routes_1.default, { prefix: "/users" });
        server.register(sessions_routes_1.default, { prefix: "/sessions" });
        server.register(todo_routes_1.default, { prefix: "/todos" });
    });
}
exports.default = indexRoutes;
