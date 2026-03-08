import { UserController } from "@controllers/user.controller";
import { Elysia, t } from "elysia";
import { container } from "tsyringe";
import { CreateUserBody, GetUserParams } from "@/presentation/schemas/user.schema";

const userController = container.resolve(UserController);

export const userRoutes = new Elysia()
  .post(
    "/users",
    async ({ body, set }) => {
      await userController.createUser(body);
      set.status = 201;
    },
    {
      body: CreateUserBody,
    },
  )
  .get("/users/:email", ({ params }) => userController.getUserByEmail(params.email), {
    params: GetUserParams,
  });
