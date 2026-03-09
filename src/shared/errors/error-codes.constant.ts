const ERROR_CODES = {
  USER_CREATE_FAILED: "USER_CREATE_FAILED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
} as const;

export { ERROR_CODES };

export type ErrorCodes = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
