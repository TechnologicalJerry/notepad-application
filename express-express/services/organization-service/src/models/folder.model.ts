import mongoose from "mongoose";

export interface FolderInput {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  color?: string;
  parentId?: mongoose.Types.ObjectId | string | null;
}

export interface FolderDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    color: {
      type: String,
      default: "#64748b",
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: Unique sibling folder names for the same user
folderSchema.index({ userId: 1, name: 1, parentId: 1 }, { unique: true });
folderSchema.index({ userId: 1, parentId: 1, updatedAt: -1 });
folderSchema.index({ name: "text" });

folderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const FolderModel = mongoose.model<FolderDocument>("Folder", folderSchema);

export default FolderModel;
