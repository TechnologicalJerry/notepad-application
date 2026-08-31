import mongoose from "mongoose";

export interface NoteInput {
  userId: mongoose.Types.ObjectId | string;
  title?: string;
  content?: string;
  folderId?: mongoose.Types.ObjectId | string | null;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

export interface NoteDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  folderId: mongoose.Types.ObjectId | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
      trim: true,
      maxlength: 255,
    },
    content: {
      type: String,
      default: "",
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
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
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

// Compound Indexes for fast querying
noteSchema.index({ userId: 1, isDeleted: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, isDeleted: 1, deletedAt: -1 });
noteSchema.index({ userId: 1, folderId: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, tags: 1, isDeleted: 1 });

noteSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const NoteModel = mongoose.model<NoteDocument>("Note", noteSchema);

export default NoteModel;
