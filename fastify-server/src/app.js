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
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = __importDefault(require("./config/db.config"));
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = (0, server_1.default)();
        try {
            yield (0, db_config_1.default)(process.env.MONGO_URI || "mongodb://localhost:27017/todos-list-application");
            const port = Number(process.env.PORT || 3000);
            yield server.listen({ port, host: "0.0.0.0" });
            console.log(`Server ready at http://localhost:${port}`);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    });
}
main();
