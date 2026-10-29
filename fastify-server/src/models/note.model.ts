import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  folderId: Types.ObjectId | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for common queries
NoteSchema.index({ userId: 1, isDeleted: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, isDeleted: 1, deletedAt: -1 });
NoteSchema.index({ userId: 1, folderId: 1, isDeleted: 1 });
NoteSchema.index({ userId: 1, tags: 1, isDeleted: 1 });
NoteSchema.index({ userId: 1, title: "text", content: "text" });

NoteSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Note = mongoose.model<INote>("Note", NoteSchema);
export default Note;
