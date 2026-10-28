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
exports.requireAuth = void 0;
const http_status_codes_1 = require("http-status-codes");
const jwt_1 = require("./jwt");
const requireAuth = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply
            .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .send({ message: "Unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (!(payload === null || payload === void 0 ? void 0 : payload.userId) || typeof payload.userId !== "string") {
            return reply
                .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .send({ message: "Unauthorized access" });
        }
        request.userId = payload.userId;
    }
    catch (_a) {
        return reply
            .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .send({ message: "Unauthorized access" });
    }
});
exports.requireAuth = requireAuth;
