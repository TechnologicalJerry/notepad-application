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
const tap_1 = require("tap");
const server_1 = __importDefault(require("../server"));
(0, tap_1.test)("requests the `/healthcheck` route", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fastify = (0, server_1.default)();
    t.teardown(() => {
        fastify.close();
    });
    const response = yield fastify.inject({
        method: "GET",
        url: "/healthcheck",
    });
    t.equal(response.statusCode, 200);
    t.same(response.json(), { status: "OK" });
}));
