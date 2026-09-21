import { createActor } from "@/backend";
import type {
  Category,
  Channel,
  ChannelDetail,
  ChannelSort,
  Program,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/** Query key factory for every backend read in StreamDeck. */
export const queryKeys = {
  channels: ["channels"] as const,
  channelsByCategory: (category: Category, sort: ChannelSort) =>
    ["channels", "category", category, sort] as const,
  channel: (channelId: bigint) => ["channel", channelId.toString()] as const,
  channelDetail: (channelId: bigint) =>
    ["channel", channelId.toString(), "detail"] as const,
  programs: (channelId: bigint) => ["programs", channelId.toString()] as const,
  favorites: ["favorites"] as const,
};

/** Every channel in the catalog. Public read. */
export function useChannels() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Channel[]>({
    queryKey: queryKeys.channels,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChannels();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Channels in one category, ordered by the given sort. Public read. */
export function useChannelsByCategory(category: Category, sort: ChannelSort) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Channel[]>({
    queryKey: queryKeys.channelsByCategory(category, sort),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChannelsByCategory(category, sort);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single channel by id. Public read. */
export function useChannel(channelId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Channel | null>({
    queryKey: queryKeys.channel(channelId ?? 0n),
    queryFn: async () => {
      if (!actor || channelId === null) return null;
      return actor.getChannel(channelId);
    },
    enabled: !!actor && !isFetching && channelId !== null,
  });
}

/** A channel with its now-playing and up-next programs. Public read. */
export function useChannelDetail(channelId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ChannelDetail | null>({
    queryKey: queryKeys.channelDetail(channelId ?? 0n),
    queryFn: async () => {
      if (!actor || channelId === null) return null;
      return actor.getChannelDetail(channelId);
    },
    enabled: !!actor && !isFetching && channelId !== null,
  });
}

/** The programs scheduled on a channel. Public read. */
export function usePrograms(channelId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Program[]>({
    queryKey: queryKeys.programs(channelId ?? 0n),
    queryFn: async () => {
      if (!actor || channelId === null) return [];
      return actor.listPrograms(channelId);
    },
    enabled: !!actor && !isFetching && channelId !== null,
  });
}
