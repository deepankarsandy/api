import { UserController } from "@controllers/user.controller";
import { Elysia, t } from "elysia";
import { container } from "tsyringe";

const userController = container.resolve(UserController);

export const userRoutes = new Elysia()
  .post(
    "/users",
    async ({ body, set }) => {
      await userController.createUser(body);
      set.status = 201;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    },
  )
  .get("/users/:email", ({ params }) => userController.getUserByEmail(params.email), {
    params: t.Object({
      email: t.String(),
    }),
  });
