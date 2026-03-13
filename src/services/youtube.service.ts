import { AppError } from "@shared/types/error.types";
import { injectable } from "tsyringe";

const PLAYLISTS_FILE_PATH = new URL("../../data/youtube-music-playlists.json", import.meta.url);
const CACHE_TTL_MS = 60 * 60 * 1000;
const PLAYLIST_ITEMS_LIMIT = 500;
const YOUTUBE_API_MAX_RESULTS = 50;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

type CachedValue<T> = {
  expiresAt: number;
  value: T;
};

type YoutubePlaylistsFile = {
  items?: unknown[];
};

type YoutubePlaylistItemsResponse = {
  items?: unknown[];
  nextPageToken?: string;
};

@injectable()
export class YoutubeService {
  private readonly cache = new Map<string, CachedValue<unknown>>();

  async listAllPlaylists(): Promise<unknown[]> {
    const cacheKey = "youtube:playlists";
    const cached = this.getFromCache<unknown[]>(cacheKey);
    if (cached) {
      console.log("Using playlist", cacheKey);
      return cached;
    }

    const fileData = (await Bun.file(PLAYLISTS_FILE_PATH).json()) as YoutubePlaylistsFile;
    const items = Array.isArray(fileData?.items) ? fileData.items : [];

    this.setCache(cacheKey, items);
    return items;
  }

  async getPlaylistItems(playlistId: string): Promise<unknown[]> {
    const normalizedPlaylistId = playlistId.trim();
    if (!normalizedPlaylistId) {
      throw new AppError("Invalid playlist id", {
        message: "playlistId is required",
        status: 400,
        code: "YOUTUBE_PLAYLIST_ID_REQUIRED",
      });
    }

    const cacheKey = `youtube:playlist-items:${normalizedPlaylistId}`;
    const cached = this.getFromCache<unknown[]>(cacheKey);
    if (cached) {
      console.log("Using cached playlist items", cacheKey);
      return cached;
    }

    const apiKey = Bun.env.YOUTUBE_DATA_API_V3;
    if (!apiKey) {
      throw new AppError("YouTube API key not configured", {
        message: "YOUTUBE_DATA_API_V3 is missing",
        status: 500,
        code: "YOUTUBE_API_KEY_MISSING",
      });
    }

    const collectedItems: unknown[] = [];
    let nextPageToken: string | undefined;

    while (collectedItems.length < PLAYLIST_ITEMS_LIMIT) {
      const remainingItems = PLAYLIST_ITEMS_LIMIT - collectedItems.length;
      const maxResults = Math.min(YOUTUBE_API_MAX_RESULTS, remainingItems);
      const requestUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      requestUrl.searchParams.set("part", "snippet,contentDetails,status");
      requestUrl.searchParams.set("playlistId", normalizedPlaylistId);
      requestUrl.searchParams.set("maxResults", String(maxResults));
      requestUrl.searchParams.set("key", apiKey);

      if (nextPageToken) {
        requestUrl.searchParams.set("pageToken", nextPageToken);
      }

      const response = await fetch(requestUrl.toString(), {
        headers: {
          // Use the 'Referer' header to satisfy Google's Website restriction
          Referer: APP_URL,
          Origin: APP_URL,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch playlist items", response.status, response);
        throw new AppError("Failed to fetch playlist items", {
          message: `YouTube API request failed with status ${response.status}`,
          status: response.status,
          code: "YOUTUBE_API_REQUEST_FAILED",
        });
      }

      const responseBody = (await response.json()) as YoutubePlaylistItemsResponse;
      const pageItems = Array.isArray(responseBody.items) ? responseBody.items : [];
      collectedItems.push(...pageItems);
      nextPageToken = responseBody.nextPageToken;

      if (!nextPageToken || pageItems.length === 0) {
        break;
      }
    }

    const items = collectedItems.slice(0, PLAYLIST_ITEMS_LIMIT);
    this.setCache(cacheKey, items);
    return items;
  }

  private getFromCache<T>(cacheKey: string): T | null {
    const cachedValue = this.cache.get(cacheKey);
    if (!cachedValue) {
      return null;
    }

    if (cachedValue.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cachedValue.value as T;
  }

  private setCache<T>(cacheKey: string, value: T): void {
    this.cache.set(cacheKey, {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }
}
