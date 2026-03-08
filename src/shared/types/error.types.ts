export interface ApiErrorResponse {
  error: unknown;
  stack?: string;
  code: string | number;
  message: string;
  status: number;
}

interface BuildApiErrorResponseArgs {
  error: unknown;
  code: string | number;
  status: number;
  includeStack: boolean;
  message?: string;
}

type ErrorLike = {
  message?: unknown;
  stack?: unknown;
  status?: unknown;
  code?: unknown;
  publicMessage?: unknown;
  userMessage?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const DEFAULT_ERROR_MESSAGE = "Something went wrong";

const CODE_BASED_MESSAGES: Record<string, string> = {
  VALIDATION: "Request validation failed",
  PARSE: "Request parsing failed",
  INVALID_COOKIE_SIGNATURE: "Invalid request cookie",
  NOT_FOUND: "Requested resource not found",
  INTERNAL_SERVER_ERROR: DEFAULT_ERROR_MESSAGE,
  UNKNOWN: DEFAULT_ERROR_MESSAGE,
};

export class AppError extends Error {
  public readonly publicMessage: string;
  public readonly status?: number;
  public readonly code?: string | number;

  constructor(
    publicMessage: string,
    options?: {
      message?: string;
      status?: number;
      code?: string | number;
      cause?: unknown;
    },
  ) {
    super(options?.message ?? publicMessage);
    this.name = "AppError";
    this.publicMessage = publicMessage;
    this.status = options?.status;
    this.code = options?.code;

    if (options?.cause !== undefined) {
      (this as unknown as { cause: unknown }).cause = options.cause;
    }
  }
}

const resolveErrorMessage = (
  error: unknown,
  code: string | number,
  fallbackMessage?: string,
): string => {
  if (typeof fallbackMessage === "string" && fallbackMessage.trim().length > 0) {
    return fallbackMessage;
  }

  if (isRecord(error)) {
    if (typeof error.publicMessage === "string" && error.publicMessage.trim().length > 0) {
      return error.publicMessage;
    }

    if (typeof error.userMessage === "string" && error.userMessage.trim().length > 0) {
      return error.userMessage;
    }
  }

  if (typeof code === "string" && CODE_BASED_MESSAGES[code]) {
    return CODE_BASED_MESSAGES[code];
  }

  return DEFAULT_ERROR_MESSAGE;
};

const getErrorStack = (error: unknown): string | undefined => {
  if (error instanceof Error && typeof error.stack === "string") {
    return error.stack;
  }

  if (isRecord(error) && typeof error.stack === "string") {
    return error.stack;
  }

  return undefined;
};

const serializeError = (error: unknown): unknown => {
  if (!(error instanceof Error)) {
    return error;
  }

  const serialized: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };

  for (const propertyName of Object.getOwnPropertyNames(error)) {
    if (propertyName === "name" || propertyName === "message" || propertyName === "stack") {
      continue;
    }

    const value = (error as unknown as Record<string, unknown>)[propertyName];
    if (typeof value !== "function") {
      serialized[propertyName] = value;
    }
  }

  return serialized;
};

export const resolveErrorStatus = (
  code: string | number,
  error: unknown,
  fallbackStatus: unknown,
): number => {
  if (
    typeof fallbackStatus === "number" &&
    Number.isFinite(fallbackStatus) &&
    fallbackStatus >= 400
  ) {
    return fallbackStatus;
  }

  const errorStatus = (error as ErrorLike | null | undefined)?.status;
  if (typeof errorStatus === "number" && Number.isFinite(errorStatus) && errorStatus >= 400) {
    return errorStatus;
  }

  if (code === "VALIDATION" || code === "PARSE" || code === "INVALID_COOKIE_SIGNATURE") {
    return 400;
  }

  if (code === "NOT_FOUND") {
    return 404;
  }

  return 500;
};

export const resolveErrorCode = (code: string | number, error: unknown): string | number => {
  const customCode = (error as ErrorLike | null | undefined)?.code;
  if (typeof customCode === "string" || typeof customCode === "number") {
    return customCode;
  }

  return code;
};

export const buildApiErrorResponse = ({
  error,
  code,
  status,
  includeStack,
  message,
}: BuildApiErrorResponseArgs): ApiErrorResponse => {
  const stack = getErrorStack(error);

  return {
    error: serializeError(error),
    code,
    message: resolveErrorMessage(error, code, message),
    status,
    ...(includeStack && stack ? { stack } : {}),
  };
};
