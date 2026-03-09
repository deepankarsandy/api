import { UserController } from "@controllers/user.controller";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import { GetUserParams, GetUserSuccessResponse } from "@/presentation/schemas/user.schema";

const userController = container.resolve(UserController);

export const userRoutes = new Elysia().get(
  "/users/:email",
  async ({ params }) => ({
    data: await userController.getUserByEmail(params.email),
  }),
  {
    params: GetUserParams,
    response: {
      200: GetUserSuccessResponse,
    },
  },
);
