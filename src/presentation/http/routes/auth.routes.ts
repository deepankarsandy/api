import { AuthController } from "@controllers/auth.controller";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import {
  SignUpWithEmailBody,
  SignUpWithEmailSuccessResponse,
} from "@/presentation/schemas/auth.schema";

const authController = container.resolve(AuthController);

export const authRoutes = new Elysia().post(
  "/auth/sign-up",
  async ({ body, request, set }) => {
    const result = await authController.signUpWithEmailAndPassword(body, request.headers);
    set.status = result.status;

    for (const [key, value] of Object.entries(result.headers)) {
      set.headers[key] = value;
    }

    return result.data as any;
  },
  {
    body: SignUpWithEmailBody,
    response: {
      200: SignUpWithEmailSuccessResponse,
    },
  },
);
