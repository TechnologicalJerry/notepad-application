import mongoose from "mongoose";
import { createLogger } from "@notepad/common-core";

const logger = createLogger("auth-service-db");

async function connect(dbUri: string) {
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(dbUri, options);
      logger.info("✅ Database connected successfully");
      return;
    } catch (error) {
      retries -= 1;
      logger.error(`Could not connect to db. Retries remaining: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      // Wait 2 seconds before retrying
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

export default connect;
