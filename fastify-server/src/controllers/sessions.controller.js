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
exports.sessionsController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
const jwt_1 = require("../middleware/jwt");
class SessionsController {
    constructor() {
        this.login = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            if (!email || !password) {
                return reply
                    .code(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .send({ message: "Email and password required" });
            }
            const user = yield user_model_1.User.findOne({ email });
            if (!user) {
                return reply.code(http_status_codes_1.StatusCodes.UNAUTHORIZED).send({
                    message: "User not found. Please sign up first.",
                });
            }
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return reply
                    .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .send({ message: "Invalid credentials" });
            }
            const userId = user._id.toString();
            const accessToken = (0, jwt_1.generateAccessToken)(userId);
            const refreshToken = (0, jwt_1.generateRefreshToken)(userId);
            yield session_model_1.LoginSession.create({
                userId,
                userName: user.userName,
                email: user.email,
                accessToken,
                refreshToken,
            });
            return reply.code(http_status_codes_1.StatusCodes.OK).send({
                message: "Login successful",
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    userName: user.userName,
                    email: user.email,
                },
            });
        });
        this.logout = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return reply
                    .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .send({ message: "You are not logged in." });
            }
            const token = authHeader.split(" ")[1];
            try {
                const payload = (0, jwt_1.verifyAccessToken)(token);
                const userId = typeof payload.userId === "string" ? payload.userId : "";
                if (!userId) {
                    return reply
                        .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                        .send({ message: "You are not logged in." });
                }
                yield session_model_1.LoginSession.deleteOne({ userId });
                return reply
                    .code(http_status_codes_1.StatusCodes.OK)
                    .send({ message: "Logout successful" });
            }
            catch (_a) {
                return reply
                    .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .send({ message: "You are not logged in." });
            }
        });
        this.me = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return reply
                    .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .send({ message: "Unauthorized" });
            }
            const token = authHeader.split(" ")[1];
            try {
                const payload = (0, jwt_1.verifyAccessToken)(token);
                const userId = typeof payload.userId === "string" ? payload.userId : "";
                if (!userId) {
                    return reply
                        .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                        .send({ message: "Unauthorized" });
                }
                const user = yield user_model_1.User.findById(userId).select("-password");
                return reply.code(http_status_codes_1.StatusCodes.OK).send({ user });
            }
            catch (_a) {
                return reply
                    .code(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .send({ message: "Unauthorized" });
            }
        });
    }
}
exports.sessionsController = new SessionsController();
