const ERROR_MESSAGES = {
  USER_CREATE_FAILED: "User creation failed",
} as const;

export { ERROR_MESSAGES };

export type ErrorMessages = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
