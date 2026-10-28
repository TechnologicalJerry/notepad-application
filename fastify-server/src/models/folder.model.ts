import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFolder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  parentId: Types.ObjectId | null;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [100, "Folder name cannot exceed 100 characters"],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    color: {
      type: String,
      default: "#6366f1",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate folder names under the same parent for the same user
FolderSchema.index({ userId: 1, parentId: 1, name: 1 }, { unique: true });
FolderSchema.index({ userId: 1, createdAt: -1 });

FolderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Folder = mongoose.model<IFolder>("Folder", FolderSchema);
export default Folder;
