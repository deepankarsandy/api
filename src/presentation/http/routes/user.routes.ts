import { UserController } from "@controllers/user.controller";
import { auth } from "@infrastructure/auth/better-auth";
import { ERROR_CODES } from "@shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@shared/errors/error-messages.constant";
import { AppError } from "@shared/types/error.types";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import { GetUserSuccessResponse } from "@/presentation/schemas/user.schema";

const userController = container.resolve(UserController);

export const userRoutes = new Elysia().get(
  "/user",
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const email = session?.user?.email;
    if (!email) {
      throw new AppError("Unauthorized", {
        message: ERROR_MESSAGES.AUTH_UNAUTHORIZED,
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        status: 401,
      });
    }

    return {
      data: await userController.getUserByEmail(email),
    };
  },
  {
    response: {
      200: GetUserSuccessResponse,
    },
    detail: {
      security: [{ bearerAuth: [] }],
    },
  },
);
