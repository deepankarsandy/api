const ERROR_MESSAGES = {
  USER_CREATE_FAILED: "User creation failed",
  USER_NOT_FOUND: "User not found",
  AUTH_SIGN_UP_FAILED: "Sign-up failed",
} as const;

export { ERROR_MESSAGES };

export type ErrorMessages = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
