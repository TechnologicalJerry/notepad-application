import mongoose from "mongoose";
import { env } from "./env.config";

export const connectDB = async (uri: string = env.MONGO_URI): Promise<typeof mongoose> => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(" MongoDB connection established successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB connection disconnected. Attempting reconnect...");
    });

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.NODE_ENV !== "production",
    });

    return conn;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log(" MongoDB connection closed gracefully");
  } catch (err) {
    console.error("Error during MongoDB disconnection:", err);
  }
};

export default connectDB;
