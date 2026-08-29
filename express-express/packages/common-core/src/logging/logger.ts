import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";

export const correlationIdStore = new AsyncLocalStorage<{ correlationId: string }>();

export const createLogger = (serviceName: string) => {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || "info",
    mixin() {
      const store = correlationIdStore.getStore();
      return store ? { correlationId: store.correlationId } : {};
    },
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
              translateTime: "yyyy-mm-dd HH:MM:ss.l",
            },
          }
        : undefined,
  });
};
