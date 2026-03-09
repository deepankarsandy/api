import { auth } from "@infrastructure/auth/better-auth";
import { AppError } from "@shared/types/error.types";
import { injectable } from "tsyringe";
import type { SignUpWithEmailBody } from "@/presentation/schemas/auth.schema";
import { ERROR_CODES } from "@/shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@/shared/errors/error-messages.constant";

type HeadersMap = Record<string, string>;

const buildDefaultName = (email: string): string => {
  const [localPart] = email.split("@");
  return localPart?.trim() || "user";
};

@injectable()
export class AuthController {
  async signUpWithEmailAndPassword(
    body: SignUpWithEmailBody,
    _incomingHeaders: Record<string, string | undefined>,
  ): Promise<{ status: number; headers: HeadersMap; data: any }> {
    try {
      const payload = {
        email: body.email,
        password: body.password,
        name: body.name?.trim() || buildDefaultName(body.email),
        ...(body.image ? { image: body.image } : {}),
      };

      return {
        status: 200,
        headers: {},
        data: await auth.api.signUpEmail({
          body: payload,
        }),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("User registration failed", {
        message: ERROR_MESSAGES.AUTH_SIGN_UP_FAILED,
        code: ERROR_CODES.AUTH_SIGN_UP_FAILED,
        status: 500,
        cause: error,
      });
    }
  }
}
