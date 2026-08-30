import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { correlationIdMiddleware, createErrorHandler, createLogger } from "@notepad/common-core";

const app = express();
const logger = createLogger(process.env.SERVICE_NAME || "api-gateway");

// 1. Security & Hardening
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      const corsOriginEnv = process.env.CORS_ORIGIN || "http://localhost:4200";
      const allowedOrigins = corsOriginEnv.split(",").map((o) => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh", "x-correlation-id", "x-request-id"],
  })
);

app.use(correlationIdMiddleware);

// 2. Rate Limiting Configurations
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later.",
      code: 429,
    },
  },
});

const defaultRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Relaxed limit for other routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: "Too many requests, please try again later.",
      code: 429,
    },
  },
});

// Apply rate limits
app.use("/api/v1/auth", authRateLimiter);
app.use("/api/v1", defaultRateLimiter);

// 3. Reverse Proxy Route Configurations
const createServiceProxy = (targetUrl: string, serviceName: string) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying (crucial for collaboration)
    onProxyReq: (proxyReq, req, res) => {
      // Propagation of correlation headers
      const correlationId =
        res.getHeader("x-correlation-id") ||
        req.headers["x-correlation-id"] ||
        req.headers["x-request-id"];
      
      if (correlationId) {
        proxyReq.setHeader("x-correlation-id", correlationId);
        proxyReq.setHeader("x-request-id", correlationId);
      }

      // Forward IP and client info
      const clientIp = req.ip || req.socket.remoteAddress || "";
      if (clientIp) {
        proxyReq.setHeader("x-forwarded-for", clientIp);
      }
      if (req.headers["user-agent"]) {
        proxyReq.setHeader("user-agent", req.headers["user-agent"]);
      }

      // Forward authentication headers
      if (req.headers["authorization"]) {
        proxyReq.setHeader("authorization", req.headers["authorization"]);
      }
      if (req.headers["x-refresh"]) {
        proxyReq.setHeader("x-refresh", req.headers["x-refresh"]);
      }
    },
    onError: (err, req, res) => {
      logger.error({ err, serviceName }, `Proxy error forwarding request to ${serviceName}`);
      res.status(502).json({
        success: false,
        error: {
          message: `Bad Gateway: Downstream service '${serviceName}' is unreachable or timed out.`,
          code: 502,
        },
      });
    },
  });
};

// Map routes to downstream URLs
const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5010";
const noteServiceUrl = process.env.NOTE_SERVICE_URL || "http://localhost:5020";
const orgServiceUrl = process.env.ORGANIZATION_SERVICE_URL || "http://localhost:5030";
const collabServiceUrl = process.env.COLLABORATION_SERVICE_URL || "http://localhost:5040";

app.use("/api/v1/auth", createServiceProxy(authServiceUrl, "auth-service"));
app.use("/api/v1/notes", createServiceProxy(noteServiceUrl, "note-service"));
app.use("/api/v1/folders", createServiceProxy(orgServiceUrl, "organization-service"));
app.use("/api/v1/tags", createServiceProxy(orgServiceUrl, "organization-service"));
app.use("/api/v1/search", createServiceProxy(orgServiceUrl, "organization-service"));
app.use("/api/v1/collaboration", createServiceProxy(collabServiceUrl, "collaboration-service"));

// 4. Health & Status Checks
app.get("/healthz", (req, res) => {
  res.status(200).json({ success: true, status: "UP" });
});

app.get("/readyz", async (req, res) => {
  const downstreamServices = [
    { name: "auth-service", url: `${authServiceUrl}/healthz` },
    { name: "note-service", url: `${noteServiceUrl}/healthz` },
    { name: "organization-service", url: `${orgServiceUrl}/healthz` },
    { name: "collaboration-service", url: `${collabServiceUrl}/healthz` },
  ];

  const statusChecks = await Promise.all(
    downstreamServices.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

        const response = await (globalThis as any).fetch(service.url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const body = (await response.json()) as { success?: boolean; status?: string };
          return {
            service: service.name,
            status: body.status === "UP" ? "UP" : "DOWN",
          };
        }
        return {
          service: service.name,
          status: "DOWN",
          error: `HTTP Status ${response.status}`,
        };
      } catch (err: any) {
        return {
          service: service.name,
          status: "DOWN",
          error: err.name === "AbortError" ? "Timeout (2s)" : err.message || "Connection failed",
        };
      }
    })
  );

  const allReady = statusChecks.every((c) => c.status === "UP");
  const httpCode = allReady ? 200 : 503;

  res.status(httpCode).json({
    success: allReady,
    status: allReady ? "READY" : "DEGRADED",
    services: statusChecks,
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `Welcome to the Notepad API Gateway (${process.env.NODE_ENV || "development"})`,
  });
});

// 5. Global Error Handling (for routes defined on the gateway itself)
app.use(createErrorHandler(logger as any));

export { app, logger };
