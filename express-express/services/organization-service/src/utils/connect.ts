import mongoose from "mongoose";
import { createLogger } from "@notepad/common-core";

const logger = createLogger("organization-service-db");

async function connect(dbUri: string): Promise<void> {
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(dbUri, options);
      logger.info("✅ Organization Database connected successfully");
      return;
    } catch (error) {
      retries -= 1;
      logger.error(`Could not connect to Organization db. Retries remaining: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

export default connect;
