import { ChannelCard } from "@/components/channel/ChannelCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogIn, Star, Tv } from "lucide-react";

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, index) => `favorite-skeleton-${index}`,
);

/** Favorites page: the signed-in caller's saved channels. */
export default function FavoritesPage() {
  const { isAuthenticated, isLoggingIn, login } = useInternetIdentity();
  const favoritesQuery = useFavorites();
  const removeFavorite = useRemoveFavorite();

  const favorites = favoritesQuery.data ?? [];

  return (
    <div
      data-ocid="favorites.page"
      className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-6 md:py-14"
    >
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="label-eyebrow">Tu parrilla personal</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Favoritos
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Los canales que has guardado, listos para sintonizar en cualquier
              momento y desde cualquier sesión.
            </p>
          </div>
          {isAuthenticated && favorites.length > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Star
                className="size-3.5 fill-current text-primary"
                aria-hidden="true"
              />
              {favorites.length} {favorites.length === 1 ? "canal" : "canales"}
            </span>
          ) : null}
        </div>
      </header>

      <section className="pt-8">
        {!isAuthenticated ? (
          <EmptyState
            data-ocid="favorites.signed_out_state"
            icon={LogIn}
            title="Inicia sesión para ver tus favoritos"
            description="Los favoritos se guardan en tu cuenta, así que necesitas iniciar sesión para consultarlos y sincronizarlos entre dispositivos."
            action={
              <Button
                type="button"
                data-ocid="favorites.signin_button"
                disabled={isLoggingIn}
                onClick={() => login()}
                className="rounded-full"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {isLoggingIn ? "Conectando…" : "Iniciar sesión"}
              </Button>
            }
          />
        ) : favoritesQuery.isLoading ? (
          <div
            data-ocid="favorites.loading_state"
            aria-busy="true"
            aria-label="Cargando favoritos"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : favoritesQuery.isError ? (
          <EmptyState
            data-ocid="favorites.error_state"
            icon={Tv}
            title="No pudimos cargar tus favoritos"
            description="Hubo un problema al consultar tu lista guardada. Vuelve a intentarlo en unos segundos."
            action={
              <Button
                type="button"
                variant="outline"
                data-ocid="favorites.retry_button"
                onClick={() => void favoritesQuery.refetch()}
                className="rounded-full"
              >
                Reintentar
              </Button>
            }
          />
        ) : favorites.length === 0 ? (
          <EmptyState
            data-ocid="favorites.empty_state"
            icon={Star}
            title="Todavía no tienes favoritos"
            description="Explora el catálogo y toca la estrella de cualquier canal para guardarlo aquí."
            action={
              <Button asChild className="rounded-full">
                <Link to="/" data-ocid="favorites.browse_link">
                  <Tv className="size-4" aria-hidden="true" />
                  Explorar canales
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((channel, index) => (
              <ChannelCard
                key={channel.id.toString()}
                channel={channel}
                index={index}
                isFavorite
                favoriteDisabled={removeFavorite.isPending}
                onToggleFavorite={(channelId) =>
                  removeFavorite.mutate(channelId)
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
