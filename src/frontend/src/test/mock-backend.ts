import type { Channel, ChannelDetail, Program } from "@/lib/types";
import { Category } from "@/lib/types";

/**
 * A typed in-memory stand-in for the generated `Backend` actor. Only the
 * methods the StreamDeck UI calls are implemented; every one is a local
 * function, so no network or canister is involved.
 */
export interface MockBackend {
  listChannels(): Promise<Channel[]>;
  listChannelsByCategory(category: Category, sort: string): Promise<Channel[]>;
  getChannel(id: bigint): Promise<Channel | null>;
  getChannelDetail(id: bigint): Promise<ChannelDetail | null>;
  listPrograms(id: bigint): Promise<Program[]>;
  listFavorites(): Promise<Channel[]>;
  addFavorite(id: bigint): Promise<void>;
  removeFavorite(id: bigint): Promise<void>;
}

const HOUR_NS = 3_600_000_000_000n;

/** Build a channel with sensible defaults; override only what a test cares about. */
export function makeChannel(overrides: Partial<Channel> = {}): Channel {
  const id = overrides.id ?? 1n;
  return {
    id,
    name: `Canal ${id.toString()}`,
    description: `Descripción del canal ${id.toString()}.`,
    isLive: true,
    logoUrl: `https://example.test/logo/${id.toString()}.png`,
    category: Category.news,
    streamUrl: `https://example.test/stream/${id.toString()}.m3u8`,
    popularity: 50n,
    ...overrides,
  };
}

/** Build a program anchored around a fixed "now" so time windows are stable. */
export function makeProgram(
  overrides: Partial<Program> & { channelId: bigint },
): Program {
  const now = 1_700_000_000_000_000_000n;
  return {
    id: overrides.channelId * 100n,
    title: `Programa de ${overrides.channelId.toString()}`,
    description: "Descripción del programa.",
    startTime: now - HOUR_NS,
    endTime: now + HOUR_NS,
    ...overrides,
  };
}

/**
 * A catalog of `count` channels spread across all six categories, mirroring the
 * backend's seeded shape (four per category at 24).
 */
export function makeCatalog(count = 24): Channel[] {
  const categories = [
    Category.news,
    Category.sports,
    Category.movies,
    Category.kids,
    Category.music,
    Category.documentary,
  ];
  return Array.from({ length: count }, (_, index) => {
    const id = BigInt(index + 1);
    return makeChannel({
      id,
      name: `Canal ${id.toString().padStart(2, "0")}`,
      category: categories[index % categories.length],
      popularity: BigInt(100 - index),
    });
  });
}

/**
 * Create a mock backend over a fixed catalog. Favorites are held in memory and
 * keyed by nothing (single caller), which is enough for the UI contract.
 */
export function createMockBackend(
  catalog: Channel[] = makeCatalog(),
): MockBackend & { favorites: Set<string> } {
  const favorites = new Set<string>();
  const byId = new Map(
    catalog.map((channel) => [channel.id.toString(), channel]),
  );

  return {
    favorites,
    async listChannels() {
      return [...catalog];
    },
    async listChannelsByCategory(category: Category, sort: string) {
      const matching = catalog.filter(
        (channel) => channel.category === category,
      );
      return [...matching].sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name, "es")
          : Number(b.popularity - a.popularity),
      );
    },
    async getChannel(id: bigint) {
      return byId.get(id.toString()) ?? null;
    },
    async getChannelDetail(id: bigint) {
      const channel = byId.get(id.toString());
      if (!channel) return null;
      return {
        channel,
        nowPlaying: makeProgram({
          channelId: id,
          title: `Ahora en ${channel.name}`,
        }),
        upNext: makeProgram({
          channelId: id,
          id: id * 100n + 1n,
          title: `Después en ${channel.name}`,
          startTime: 1_700_000_000_000_000_000n + HOUR_NS,
          endTime: 1_700_000_000_000_000_000n + 2n * HOUR_NS,
        }),
      };
    },
    async listPrograms(id: bigint) {
      const detail = await this.getChannelDetail(id);
      return detail
        ? [detail.nowPlaying, detail.upNext].filter(
            (program): program is Program => Boolean(program),
          )
        : [];
    },
    async listFavorites() {
      return catalog.filter((channel) => favorites.has(channel.id.toString()));
    },
    async addFavorite(id: bigint) {
      favorites.add(id.toString());
    },
    async removeFavorite(id: bigint) {
      favorites.delete(id.toString());
    },
  };
}
