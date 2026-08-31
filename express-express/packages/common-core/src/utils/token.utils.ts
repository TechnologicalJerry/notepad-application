import jwt from "jsonwebtoken";
import { UserPayload } from "../types/auth.types";

let cachedPublicKey: string | null = null;

export function formatPublicKey(key: string): string {
  if (!key) return "";
  if (key.includes("-----BEGIN")) {
    return key;
  }
  try {
    const decoded = Buffer.from(key, "base64").toString("ascii");
    if (decoded.includes("-----BEGIN")) {
      return decoded;
    }
  } catch {
    // If not base64, return original
  }
  return key;
}

export function setPublicKey(key: string): void {
  cachedPublicKey = formatPublicKey(key);
}

export function getPublicKey(): string | null {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }
  const envKey = process.env.ACCESS_TOKEN_PUBLIC_KEY;
  if (envKey) {
    cachedPublicKey = formatPublicKey(envKey);
    return cachedPublicKey;
  }
  return null;
}

export async function fetchPublicKey(authServiceUrl?: string): Promise<string> {
  const baseUrl = authServiceUrl || process.env.AUTH_SERVICE_URL || "http://localhost:5010";
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/auth/public-key`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await (globalThis as any).fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch public key: HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawKey = data?.data?.publicKey || data?.publicKey;
    if (!rawKey) {
      throw new Error("Invalid response format: publicKey not found in payload");
    }

    const formattedKey = formatPublicKey(rawKey);
    setPublicKey(formattedKey);
    return formattedKey;
  } catch (error: any) {
    const fallback = getPublicKey();
    if (fallback) {
      return fallback;
    }
    throw new Error(`Unable to obtain auth public key from ${url}: ${error.message}`);
  }
}

export function verifyAccessToken(
  token: string,
  publicKey?: string
): { valid: boolean; expired: boolean; decoded: UserPayload | null } {
  const keyToUse = publicKey ? formatPublicKey(publicKey) : getPublicKey();

  if (!keyToUse) {
    return {
      valid: false,
      expired: false,
      decoded: null,
    };
  }

  try {
    const decoded = jwt.verify(token, keyToUse, {
      algorithms: ["RS256"],
    }) as UserPayload;

    // Normalise _id and id if needed
    if (decoded && !decoded._id && decoded.id) {
      decoded._id = decoded.id;
    }

    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === "jwt expired" || e.name === "TokenExpiredError",
      decoded: null,
    };
  }
}
