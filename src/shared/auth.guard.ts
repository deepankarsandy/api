import { ERROR_CODES } from "@shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@shared/errors/error-messages.constant";
import { AppError } from "@shared/types/error.types";
import { Elysia } from "elysia";

const JWT_ALGORITHM = "HS256";

type JwtPayload = {
  exp?: number;
  nbf?: number;
};

const unauthorizedError = () =>
  new AppError("Unauthorized", {
    message: ERROR_MESSAGES.AUTH_UNAUTHORIZED,
    code: ERROR_CODES.AUTH_UNAUTHORIZED,
    status: 401,
  });

const toBase64 = (input: string): string => input + "=".repeat((4 - (input.length % 4)) % 4);

const decodeBase64UrlToBytes = (value: string): Uint8Array => {
  const base64 = toBase64(value.replace(/-/g, "+").replace(/_/g, "/"));
  const decoded = atob(base64);

  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
};

const decodeBase64UrlToJson = <T>(value: string): T => {
  const decodedBytes = decodeBase64UrlToBytes(value);
  const decodedString = new TextDecoder().decode(decodedBytes);
  return JSON.parse(decodedString) as T;
};

const verifyHs256Signature = async (
  signingInput: string,
  encodedSignature: string,
  secret: string,
): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64UrlToBytes(encodedSignature).buffer as ArrayBuffer,
    new TextEncoder().encode(signingInput),
  );
};

const validateJwt = async (token: string): Promise<void> => {
  const secret = Bun.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw unauthorizedError();
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw unauthorizedError();
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeBase64UrlToJson<{ alg?: string }>(encodedHeader);

  if (header.alg !== JWT_ALGORITHM) {
    throw unauthorizedError();
  }

  const isValidSignature = await verifyHs256Signature(
    `${encodedHeader}.${encodedPayload}`,
    encodedSignature,
    secret,
  );

  if (!isValidSignature) {
    throw unauthorizedError();
  }

  const payload = decodeBase64UrlToJson<JwtPayload>(encodedPayload);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === "number" && nowInSeconds >= payload.exp) {
    throw unauthorizedError();
  }

  if (typeof payload.nbf === "number" && nowInSeconds < payload.nbf) {
    throw unauthorizedError();
  }
};

const extractBearerToken = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export const jwtAuthGuard = new Elysia({ name: "jwt-auth-guard" }).onRequest(
  async ({ request }) => {
    try {
      const authorizationHeader = request.headers.get("authorization");
      const token = extractBearerToken(authorizationHeader);

      if (!token) {
        throw unauthorizedError();
      }

      await validateJwt(token);
    } catch {
      throw unauthorizedError();
    }
  },
);
