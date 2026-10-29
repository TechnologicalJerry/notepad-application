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
const sessions_controller_1 = require("../controllers/sessions.controller");
function sessionsRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/login", sessions_controller_1.sessionsController.login);
        server.post("/logout", sessions_controller_1.sessionsController.logout);
        server.get("/me", sessions_controller_1.sessionsController.me);
    });
}
exports.default = sessionsRoutes;
