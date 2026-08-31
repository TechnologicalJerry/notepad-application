import { correlationIdStore } from "../logging/logger";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../errors/app-error";

export interface ServiceRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  retries?: number;
  internalKey?: string;
  requestId?: string;
}

export class ServiceClient {
  private defaultTimeoutMs: number;
  private defaultRetries: number;

  constructor(options?: { defaultTimeoutMs?: number; defaultRetries?: number }) {
    this.defaultTimeoutMs = options?.defaultTimeoutMs ?? 5000;
    this.defaultRetries = options?.defaultRetries ?? 3;
  }

  private getInternalKey(): string {
    return process.env.INTERNAL_SERVICE_KEY || "notepad-internal-service-secret";
  }

  private getCorrelationId(customId?: string): string {
    if (customId) return customId;
    const store = correlationIdStore.getStore();
    return store?.correlationId || "";
  }

  private transformError(status: number, message: string, details?: any): AppError {
    switch (status) {
      case 400:
        return new BadRequestError(message, details);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message, details);
      case 422:
        return new UnprocessableEntityError(message, details);
      default:
        return new AppError(message || `Inter-service error: HTTP ${status}`, status, details);
    }
  }

  async request<T = any>(url: string, options: ServiceRequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      timeoutMs = this.defaultTimeoutMs,
      retries = this.defaultRetries,
      internalKey = this.getInternalKey(),
      requestId = this.getCorrelationId(options.requestId),
    } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-internal-service-key": internalKey,
      ...headers,
    };

    if (requestId) {
      requestHeaders["x-request-id"] = requestId;
      requestHeaders["x-correlation-id"] = requestId;
    }

    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await (globalThis as any).fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data: any = null;
        const contentType = response.headers?.get?.("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          try {
            data = await response.json();
          } catch {
            data = await response.text();
          }
        }

        if (response.ok) {
          // If response is wrapped in standard { success: true, data: ... }, unwrap data
          if (data && typeof data === "object" && "data" in data && "success" in data) {
            return data.data !== undefined ? data.data : data;
          }
          return data as T;
        }

        const errMsg =
          data?.error?.message || data?.message || `Service request failed with HTTP ${response.status}`;
        const errDetails = data?.error?.details || data?.details || null;

        // 4xx client errors (except 429) should not retry
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw this.transformError(response.status, errMsg, errDetails);
        }

        lastError = this.transformError(response.status, errMsg, errDetails);
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err instanceof AppError && err.statusCode < 500 && err.statusCode !== 429) {
          throw err;
        }

        if (err.name === "AbortError") {
          lastError = new AppError(`Inter-service request to ${url} timed out after ${timeoutMs}ms`, 504);
        } else if (!(err instanceof AppError)) {
          lastError = new AppError(`Network error connecting to ${url}: ${err.message}`, 502);
        } else {
          lastError = err;
        }
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 100 + Math.floor(Math.random() * 50);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw lastError;
  }

  get<T = any>(url: string, options?: Omit<ServiceRequestOptions, "method">): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  post<T = any>(url: string, data?: any, options?: Omit<ServiceRequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(url, { ...options, method: "POST", body: data });
  }

  put<T = any>(url: string, data?: any, options?: Omit<ServiceRequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(url, { ...options, method: "PUT", body: data });
  }

  patch<T = any>(url: string, data?: any, options?: Omit<ServiceRequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(url, { ...options, method: "PATCH", body: data });
  }

  delete<T = any>(url: string, options?: Omit<ServiceRequestOptions, "method">): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }
}

export const serviceClient = new ServiceClient();
