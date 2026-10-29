"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
const mongoose_1 = require("mongoose");
const todoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title should not be empty!"],
        unique: true,
    },
    body: {
        type: String,
        required: [true, "Body should not be empty!"],
        unique: false,
    },
    category: {
        type: String,
        required: [true, "Category should not be empty!"],
        unique: false,
    },
    subCategory: {
        type: String,
        required: [true, "Sub Category should not be empty!"],
        unique: false,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.Todo = (0, mongoose_1.model)("Todo", todoSchema);
