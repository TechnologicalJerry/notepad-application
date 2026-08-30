import jwt from "jsonwebtoken";

export function signJwt(
  object: Object,
  keyType: "ACCESS" | "REFRESH",
  options?: jwt.SignOptions
): string {
  const base64Key =
    keyType === "ACCESS"
      ? process.env.ACCESS_TOKEN_PRIVATE_KEY
      : process.env.REFRESH_PRIVATE_KEY;

  if (!base64Key) {
    throw new Error(`Private signing key for ${keyType} is not defined in environment`);
  }

  const signingKey = Buffer.from(base64Key, "base64").toString("ascii");

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyType: "ACCESS" | "REFRESH"
): { valid: boolean; expired: boolean; decoded: T | null } {
  const base64Key =
    keyType === "ACCESS"
      ? process.env.ACCESS_TOKEN_PUBLIC_KEY
      : process.env.REFRESH_PUBLIC_KEY;

  if (!base64Key) {
    throw new Error(`Public verification key for ${keyType} is not defined in environment`);
  }

  const publicKey = Buffer.from(base64Key, "base64").toString("ascii");

  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}
