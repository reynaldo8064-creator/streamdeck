import { createActor } from "@/backend";
import type { Channel } from "@/backend";
import { queryKeys } from "@/hooks/use-backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The signed-in caller's favorite channels. Requires sign-in. */
export function useFavorites() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toText() ?? "anonymous";
  return useQuery<Channel[]>({
    queryKey: [...queryKeys.favorites, principal],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFavorites();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

/** Add a channel to the caller's favorites. Requires sign-in. */
export function useAddFavorite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: bigint) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.addFavorite(channelId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}

/** Remove a channel from the caller's favorites. Requires sign-in. */
export function useRemoveFavorite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: bigint) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.removeFavorite(channelId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
