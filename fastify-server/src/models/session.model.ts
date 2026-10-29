import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILoginSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  email: string;
  refreshToken: string;
  isValid: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically prune expired sessions after 30 days
LoginSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const LoginSession = mongoose.model<ILoginSession>("LoginSession", LoginSessionSchema);
export default LoginSession;
