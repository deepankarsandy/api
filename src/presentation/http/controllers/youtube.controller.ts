import type { YoutubeService } from "@/services/youtube.service";

export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  async listAllPlaylists(): Promise<unknown[]> {
    return this.youtubeService.listAllPlaylists();
  }

  async getPlaylistItems(playlistId: string): Promise<unknown[]> {
    return this.youtubeService.getPlaylistItems(playlistId);
  }
}
