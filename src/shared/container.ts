import { UserController } from "@controllers/user.controller";
import { YoutubeController } from "@controllers/youtube.controller";
import { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { UserRepository } from "@repositories/user.repository";
import { container } from "tsyringe";
import { YoutubeService } from "@/services/youtube.service";

// Register your dependencies here
container.registerSingleton("UserRepository", UserRepository);

container.register(GetUserByEmailHandler, {
  useFactory: (dependencyContainer) =>
    new GetUserByEmailHandler(dependencyContainer.resolve("UserRepository")),
});

container.register(UserController, {
  useFactory: (dependencyContainer) =>
    new UserController(dependencyContainer.resolve(GetUserByEmailHandler)),
});

container.registerSingleton("YoutubeService", YoutubeService);

container.register(YoutubeController, {
  useFactory: (dependencyContainer) =>
    new YoutubeController(dependencyContainer.resolve(YoutubeService)),
});

export default container;
