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
const user_controller_1 = require("../controllers/user.controller");
function userRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/", user_controller_1.userController.createUser);
        server.get("/", user_controller_1.userController.getAllUsers);
        server.get("/:id", user_controller_1.userController.getUserById);
        server.patch("/:id", user_controller_1.userController.updateUser);
        server.delete("/:id", user_controller_1.userController.deleteUser);
    });
}
exports.default = userRoutes;
