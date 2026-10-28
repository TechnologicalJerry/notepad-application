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
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const index_routes_1 = __importDefault(require("./routes/index.routes"));
function buildServer() {
    const server = (0, fastify_1.default)({ logger: true });
    const allowedOrigins = ["http://localhost:3000", "http://localhost:4200"];
    server.register(cors_1.default, {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"), false);
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    });
    server.get("/healthcheck", () => __awaiter(this, void 0, void 0, function* () {
        return { status: "OK" };
    }));
    server.get("/check", (_request, reply) => __awaiter(this, void 0, void 0, function* () {
        return reply.type("text/html").send(`
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Server Health Check</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              background-color: #fff;
              padding: 50px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              width: 80%;
              max-width: 600px;
            }
            h1 {
              font-size: 2.5rem;
              color: #333;
            }
            p {
              font-size: 1.2rem;
              color: #555;
            }
            .status {
              font-size: 1.5rem;
              color: green;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Todo List API</h1>
            <p>Welcome to the Todo List Application built with TypeScript, Fastify, and MongoDB.</p>
            <div class="status">Server is Healthy and Running!</div>
          </div>
        </body>
      </html>
    `);
    }));
    server.register(index_routes_1.default, { prefix: "/api" });
    return server;
}
exports.default = buildServer;
