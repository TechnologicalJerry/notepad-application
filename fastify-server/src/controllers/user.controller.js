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
exports.userController = void 0;
const http_status_codes_1 = require("http-status-codes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
class UserController {
    constructor() {
        this.createUser = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userName, firstName, middleName, lastName, email, password } = request.body;
            if (!userName || !firstName || !lastName || !email || !password) {
                return reply.code(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                    msg: "All fields (userName, firstName, lastName, email, password) are required.",
                });
            }
            try {
                const existingUser = yield user_model_1.User.findOne({ email });
                if (existingUser) {
                    return reply
                        .code(http_status_codes_1.StatusCodes.CONFLICT)
                        .send({ msg: "Email already exists." });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                const newUser = yield user_model_1.User.create({
                    userName,
                    firstName,
                    middleName,
                    lastName,
                    email,
                    password: hashedPassword,
                });
                return reply
                    .code(http_status_codes_1.StatusCodes.CREATED)
                    .send({ user: newUser, msg: "User created successfully." });
            }
            catch (error) {
                request.log.error(error);
                return reply
                    .code(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .send({ msg: "Error creating user." });
            }
        });
        this.getAllUsers = (_request, reply) => __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.User.find().sort("-createdAt");
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ users, msg: "All users fetched successfully." });
        });
        this.getUserById = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const user = yield user_model_1.User.findById(id);
            if (!user) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "User not found." });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ user, msg: "User fetched successfully." });
        });
        this.updateUser = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const payload = request.body;
            const updatedUser = yield user_model_1.User.findByIdAndUpdate(id, payload, {
                new: true,
            });
            if (!updatedUser) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "User not found." });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ user: updatedUser, msg: "User updated successfully." });
        });
        this.deleteUser = (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const deletedUser = yield user_model_1.User.findByIdAndDelete(id);
            if (!deletedUser) {
                return reply
                    .code(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .send({ msg: "User not found." });
            }
            return reply
                .code(http_status_codes_1.StatusCodes.OK)
                .send({ user: deletedUser, msg: "User deleted successfully." });
        });
    }
}
exports.userController = new UserController();
