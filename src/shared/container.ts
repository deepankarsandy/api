import { UserController } from "@controllers/user.controller";
import { CreateUserHandler } from "@handlers/user/create-user.handler";
import { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { UserRepository } from "@repositories/user.repository";
import { container } from "tsyringe";

// Register your dependencies here
container.registerSingleton("UserRepository", UserRepository);

container.register(CreateUserHandler, {
  useFactory: (dependencyContainer) =>
    new CreateUserHandler(dependencyContainer.resolve("UserRepository")),
});

container.register(GetUserByEmailHandler, {
  useFactory: (dependencyContainer) =>
    new GetUserByEmailHandler(dependencyContainer.resolve("UserRepository")),
});

container.register(UserController, {
  useFactory: (dependencyContainer) =>
    new UserController(
      dependencyContainer.resolve(CreateUserHandler),
      dependencyContainer.resolve(GetUserByEmailHandler),
    ),
});

export default container;
