import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface SessionDocument extends mongoose.Document {
  user: UserDocument["_id"];
  valid: boolean;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    valid: { type: Boolean, required: true, default: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;
