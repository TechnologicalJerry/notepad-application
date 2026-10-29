import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITodo extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  body: string;
  category: string;
  subCategory: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title should not be empty!"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body should not be empty!"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category should not be empty!"],
      trim: true,
    },
    subCategory: {
      type: String,
      required: [true, "Sub Category should not be empty!"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate todo titles per user
todoSchema.index({ userId: 1, title: 1 }, { unique: true });
todoSchema.index({ userId: 1, completed: 1, createdAt: -1 });

todoSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Todo = mongoose.model<ITodo>("Todo", todoSchema);
export default Todo;
