import { ChannelCard } from "@/components/channel/ChannelCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannelDetail, useChannelsByCategory } from "@/hooks/use-backend";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { categoryLabel } from "@/lib/categories";
import type { Channel, Program } from "@/lib/types";
import {
  Category,
  ChannelSort,
  channelNumber,
  formatDuration,
  formatTime,
  timestampToDate,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  LogIn,
  Radio,
  SignalHigh,
  Star,
  Tv,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SKELETON_IDS = Array.from(
  { length: 4 },
  (_, i) => `related-skeleton-${i}`,
);

/** Parse the route param into a channel id, or null when it is not numeric. */
function parseChannelId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

/** A single row in the now-playing / up-next schedule list. */
function ProgramRow({
  program,
  index,
  isNowPlaying,
}: {
  program: Program;
  index: number;
  isNowPlaying: boolean;
}) {
  const start = timestampToDate(program.startTime);
  const end = timestampToDate(program.endTime);
  const timeRange =
    start && end
      ? `${formatTime(program.startTime)} – ${formatTime(program.endTime)}`
      : "Horario no disponible";

  return (
    <li
      data-ocid={`channel.program.item.${index + 1}`}
      className={cn(
        "flex gap-4 rounded-lg border p-4 transition-quick",
        isNowPlaying
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card/60 hover:border-primary/30",
      )}
    >
      <div className="flex w-24 shrink-0 flex-col items-start gap-1 border-r border-border pr-4">
        <span className="font-mono text-sm font-semibold text-foreground">
          {formatTime(program.startTime)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatTime(program.endTime)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 truncate font-display text-base font-semibold tracking-tight text-foreground">
            {program.title}
          </h3>
          {isNowPlaying ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-tally-pulse" />
              En emisión
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {program.description}
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {timeRange} · {formatDuration(program.startTime, program.endTime)}
        </p>
      </div>
    </li>
  );
}

/** 16:9 player surface: loads the sample stream when configured, else a placeholder. */
function PlayerSurface({ channel }: { channel: Channel }) {
  const hasStream = channel.streamUrl.trim().length > 0;

  return (
    <div
      data-ocid="channel.player.panel"
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-background shadow-player"
    >
      {hasStream ? (
        // biome-ignore lint/a11y/useMediaCaption: sample stream sources ship no caption track
        <video
          key={channel.streamUrl}
          data-ocid="channel.player.video"
          className="size-full bg-background object-contain"
          src={channel.streamUrl}
          poster={channel.logoUrl}
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <div
          data-ocid="channel.player.empty_state"
          className="flex size-full flex-col items-center justify-center gap-4 bg-gradient-subtle px-6 text-center"
        >
          <div className="relative flex size-16 items-center justify-center rounded-full border border-border bg-card/70">
            <Tv className="size-7 text-muted-foreground" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary/70" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Señal no configurada
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Este canal todavía no tiene una fuente de emisión asignada. La
              parrilla y la información del canal siguen disponibles.
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
          <SignalHigh className="size-3" aria-hidden="true" />
          Canal {channelNumber(channel.id)}
        </span>
        {channel.isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary animate-tally-pulse" />
            Live
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Loading skeleton matching the detail layout. */
function DetailSkeleton() {
  return (
    <div data-ocid="channel.loading_state" className="space-y-8">
      <Skeleton className="h-5 w-40 rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-8 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Channel detail: featured 16:9 player, channel identity, favorite control,
 * now-playing / up-next schedule and related channels from the same category.
 */
export default function ChannelDetailPage() {
  const { channelId: rawChannelId } = useParams({ strict: false });
  const channelId = useMemo(
    () => parseChannelId(rawChannelId ?? ""),
    [rawChannelId],
  );

  const { isAuthenticated, isLoggingIn, login } = useInternetIdentity();
  const detailQuery = useChannelDetail(channelId);
  const detail = detailQuery.data ?? null;
  const channel = detail?.channel ?? null;

  const relatedQuery = useChannelsByCategory(
    channel?.category ?? Category.news,
    ChannelSort.popularity,
  );
  const favoritesQuery = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  useEffect(() => {
    if (channel) document.title = `${channel.name} · StreamDeck`;
  }, [channel]);

  const favorites = favoritesQuery.data ?? [];
  const isFavorite = channel
    ? favorites.some((item) => item.id === channel.id)
    : false;
  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

  function handleToggleFavorite(id: bigint) {
    setFavoriteError(null);
    const mutation = isFavorite ? removeFavorite : addFavorite;
    mutation.mutate(id, {
      onError: () =>
        setFavoriteError(
          "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        ),
    });
  }

  const related = (relatedQuery.data ?? []).filter(
    (item) => item.id !== channelId,
  );

  if (channelId === null) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-6">
        <EmptyState
          data-ocid="channel.error_state"
          icon={Tv}
          title="Canal no encontrado"
          description="El identificador de canal no es válido. Vuelve al catálogo para elegir una señal disponible."
          action={
            <Button asChild className="rounded-full">
              <Link to="/" search={{}} data-ocid="channel.back_button">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver al catálogo
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !channel) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-6">
        <EmptyState
          data-ocid="channel.error_state"
          icon={Tv}
          title="Canal no disponible"
          description="No hemos podido cargar este canal. Puede que ya no esté en la parrilla o que la señal esté temporalmente fuera de línea."
          action={
            <Button asChild className="rounded-full">
              <Link to="/" search={{}} data-ocid="channel.back_button">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver al catálogo
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const schedule: Program[] = [detail?.nowPlaying, detail?.upNext].filter(
    (program): program is Program => Boolean(program),
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6">
      <nav aria-label="Migas de pan" className="mb-6">
        <Link
          to="/"
          search={{}}
          data-ocid="channel.back_button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-quick hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Catálogo
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <PlayerSurface channel={channel} />

          <section
            data-ocid="channel.section"
            className="animate-fade-in-up rounded-lg border border-border bg-card p-6 shadow-subtle"
          >
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-subtle">
                <img
                  src={channel.logoUrl}
                  alt={`Logotipo de ${channel.name}`}
                  className="size-14 object-contain"
                  onError={(event) => {
                    event.currentTarget.src = "/assets/images/placeholder.svg";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {categoryLabel(channel.category)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Canal {channelNumber(channel.id)}
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
                  {channel.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {channel.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {channel.popularity.toString()} espectadores
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Radio className="size-3.5" aria-hidden="true" />
                    {channel.isLive ? "Señal en directo" : "Fuera de línea"}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-stretch gap-2">
                {isAuthenticated ? (
                  <Button
                    type="button"
                    data-ocid="channel.favorite_button"
                    aria-pressed={isFavorite}
                    disabled={favoritePending}
                    onClick={() => handleToggleFavorite(channel.id)}
                    variant={isFavorite ? "default" : "outline"}
                    className="rounded-full"
                  >
                    <Star
                      className={cn("size-4", isFavorite && "fill-current")}
                      aria-hidden="true"
                    />
                    {isFavorite ? "En favoritos" : "Añadir a favoritos"}
                  </Button>
                ) : (
                  <div
                    data-ocid="channel.signin_prompt"
                    className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      Inicia sesión para guardar este canal en tus favoritos.
                    </p>
                    <Button
                      type="button"
                      data-ocid="channel.signin_button"
                      disabled={isLoggingIn}
                      onClick={() => login()}
                      className="mt-3 w-full rounded-full"
                    >
                      <LogIn className="size-4" aria-hidden="true" />
                      {isLoggingIn ? "Conectando…" : "Iniciar sesión"}
                    </Button>
                  </div>
                )}
                {favoriteError ? (
                  <p
                    data-ocid="channel.error_state"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {favoriteError}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section data-ocid="channel.section" className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock
                className="size-4 text-primary"
                aria-hidden="true"
              />
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Parrilla de hoy
              </h2>
            </div>

            {schedule.length > 0 ? (
              <ul data-ocid="channel.program.list" className="space-y-3">
                {schedule.map((program, index) => (
                  <ProgramRow
                    key={program.id.toString()}
                    program={program}
                    index={index}
                    isNowPlaying={index === 0}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                data-ocid="channel.program.empty_state"
                icon={CalendarClock}
                title="Sin programación"
                description="Todavía no hay programas publicados para este canal. Vuelve más tarde para consultar la parrilla."
              />
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Canales similares
            </h2>
            <Link
              to="/"
              search={{}}
              data-ocid="channel.related.link"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-quick hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Ver todos
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {relatedQuery.isLoading ? (
            <div data-ocid="channel.loading_state" className="space-y-4">
              {SKELETON_IDS.map((id) => (
                <Skeleton key={id} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : related.length > 0 ? (
            <div data-ocid="channel.related.list" className="space-y-4">
              {related.map((item, index) => (
                <ChannelCard
                  key={item.id.toString()}
                  channel={item}
                  index={index}
                  isFavorite={favorites.some((fav) => fav.id === item.id)}
                  onToggleFavorite={
                    isAuthenticated ? handleToggleFavorite : undefined
                  }
                  favoriteDisabled={favoritePending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              data-ocid="channel.related.empty_state"
              icon={Tv}
              title="Sin canales similares"
              description="No hay otros canales en esta categoría por ahora."
            />
          )}
        </aside>
      </div>
    </div>
  );
}
