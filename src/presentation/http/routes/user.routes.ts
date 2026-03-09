import { UserController } from "@controllers/user.controller";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import {
  CreateUserBody,
  CreateUserSuccessResponse,
  GetUserParams,
  GetUserSuccessResponse,
} from "@/presentation/schemas/user.schema";

const userController = container.resolve(UserController);

export const userRoutes = new Elysia()
  .post(
    "/users",
    async ({ body, set }) => {
      await userController.createUser(body);
      set.status = 201;
      return { data: null };
    },
    {
      body: CreateUserBody,
      response: {
        201: CreateUserSuccessResponse,
      },
    },
  )
  .get(
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
