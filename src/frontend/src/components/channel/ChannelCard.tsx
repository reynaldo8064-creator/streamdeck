import { useChannelDetail } from "@/hooks/use-backend";
import { categoryLabel } from "@/lib/categories";
import type { Channel } from "@/lib/types";
import { channelNumber, formatTime } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Radio, Star } from "lucide-react";

interface ChannelCardProps {
  channel: Channel;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: bigint) => void;
  favoriteDisabled?: boolean;
}

/**
 * Channel tile: logo plate, mono channel number, LIVE tally, name, category
 * and an optional favorite toggle. The whole card links to the detail route.
 */
export function ChannelCard({
  channel,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
  favoriteDisabled = false,
}: ChannelCardProps) {
  const detailQuery = useChannelDetail(channel.id);
  const nowPlaying = detailQuery.data?.nowPlaying ?? null;

  return (
    <article
      data-ocid={`browse.item.${index + 1}`}
      className="card-hover-lift group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <Link
        to="/channel/$channelId"
        params={{ channelId: channel.id.toString() }}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b border-border bg-gradient-subtle">
          <img
            src={channel.logoUrl}
            alt={`Logotipo de ${channel.name}`}
            loading="lazy"
            className="size-16 rounded-md object-contain opacity-90 transition-smooth group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = "/assets/images/placeholder.svg";
            }}
          />
          <span className="absolute left-3 top-3 rounded-sm bg-background/80 px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground backdrop-blur">
            {channelNumber(channel.id)}
          </span>
          {channel.isLive ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary animate-tally-pulse" />
              Live
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold tracking-tight text-foreground">
              {channel.name}
            </h3>
            <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {categoryLabel(channel.category)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {channel.description}
          </p>
          <div className="mt-auto flex flex-col gap-1.5 pt-1">
            <p className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
              <Radio
                className="size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="truncate font-medium">
                {nowPlaying
                  ? nowPlaying.title
                  : detailQuery.isLoading
                    ? "Cargando programación…"
                    : "Sin programación"}
              </span>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {nowPlaying
                ? `${formatTime(nowPlaying.startTime)} – ${formatTime(
                    nowPlaying.endTime,
                  )}`
                : `${channel.popularity.toString()} espectadores`}
            </p>
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <button
          type="button"
          data-ocid={`browse.favorite_button.${index + 1}`}
          aria-label={
            isFavorite
              ? `Quitar ${channel.name} de favoritos`
              : `Añadir ${channel.name} a favoritos`
          }
          aria-pressed={isFavorite}
          disabled={favoriteDisabled}
          onClick={() => onToggleFavorite(channel.id)}
          className={cn(
            "absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full border transition-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50",
            isFavorite
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          <Star
            className={cn("size-4", isFavorite && "fill-current")}
            aria-hidden="true"
          />
        </button>
      ) : null}
    </article>
  );
}
