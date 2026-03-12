import { YoutubeController } from "@controllers/youtube.controller";
import { Elysia, t } from "elysia";
import { container } from "tsyringe";

const youtubeController = container.resolve(YoutubeController);

export const youtubeRoutes = new Elysia({ prefix: "/youtube" })
  .get("/playlists", async () => {
    return {
      data: await youtubeController.listAllPlaylists(),
    };
  })
  .get(
    "/playlists/:playlistId/items",
    async ({ params }) => {
      return {
        data: await youtubeController.getPlaylistItems(params.playlistId),
      };
    },
    {
      params: t.Object({
        playlistId: t.String({ minLength: 1 }),
      }),
    },
  );
