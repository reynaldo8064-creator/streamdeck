import { Category, ChannelSort } from "@/backend";
import { CategoryFilter } from "@/components/channel/CategoryFilter";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannels, useChannelsByCategory } from "@/hooks/use-backend";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { categoryLabel } from "@/lib/categories";
import type {
  CategoryFilter as CategoryFilterValue,
  ChannelSortOrder,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowDownWideNarrow, Radio, SearchX, Tv, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SORT_OPTIONS: { value: ChannelSortOrder; label: string }[] = [
  { value: "popularity", label: "Más vistos" },
  { value: "name", label: "A–Z" },
];

const SKELETON_IDS = Array.from(
  { length: 8 },
  (_, i) => `browse-skeleton-${i}`,
);

function isCategoryFilter(
  value: string | undefined,
): value is CategoryFilterValue {
  return (
    value === "all" ||
    (value !== undefined &&
      (Object.values(Category) as string[]).includes(value))
  );
}

/** Build the route search object for the current filter state. */
function buildSearch(next: {
  q: string;
  category: CategoryFilterValue;
  sort: ChannelSortOrder;
}): { q?: string; category?: string; sort?: string } {
  const trimmed = next.q.trim();
  return {
    q: trimmed.length > 0 ? trimmed : undefined,
    category: next.category === "all" ? undefined : next.category,
    sort: next.sort === "popularity" ? undefined : next.sort,
  };
}

/**
 * Channel catalog: searchable, category-filtered and sortable grid of live TV
 * channels. Search lives in the route's `q` param; category and sort are
 * mirrored into the URL so any view is shareable and survives a refresh.
 */
export default function BrowsePage() {
  const {
    q,
    category: categoryParam,
    sort: sortParam,
  } = useSearch({
    from: "/",
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useInternetIdentity();

  const category: CategoryFilterValue = isCategoryFilter(categoryParam)
    ? categoryParam
    : "all";
  const sort: ChannelSortOrder = sortParam === "name" ? "name" : "popularity";
  const [draft, setDraft] = useState(q ?? "");

  // Keep the local search draft in sync when the header drives the `q` param.
  useEffect(() => {
    setDraft(q ?? "");
  }, [q]);

  const backendSort =
    sort === "name" ? ChannelSort.name : ChannelSort.popularity;

  const allQuery = useChannels();
  const categoryQuery = useChannelsByCategory(
    category === "all" ? Category.news : category,
    backendSort,
  );

  const activeQuery = category === "all" ? allQuery : categoryQuery;
  const channels = activeQuery.data ?? [];

  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((channel) => channel.id.toString())),
    [favorites],
  );

  const visibleChannels = useMemo(() => {
    const term = (q ?? "").trim().toLocaleLowerCase("es");
    const filtered = term
      ? channels.filter((channel) =>
          channel.name.toLocaleLowerCase("es").includes(term),
        )
      : channels;
    if (category !== "all") return filtered;
    return [...filtered].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "es")
        : Number(b.popularity - a.popularity),
    );
  }, [channels, q, category, sort]);

  function handleCategoryChange(next: CategoryFilterValue) {
    void navigate({
      to: "/",
      search: buildSearch({ q: draft, category: next, sort }),
    });
  }

  function handleSortChange(next: ChannelSortOrder) {
    void navigate({
      to: "/",
      search: buildSearch({ q: draft, category, sort: next }),
    });
  }

  /** Instant search: mirror every keystroke into the `q` URL param. */
  function handleSearchChange(value: string) {
    setDraft(value);
    void navigate({
      to: "/",
      search: buildSearch({ q: value, category, sort }),
      replace: true,
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({
      to: "/",
      search: buildSearch({ q: draft, category, sort }),
    });
  }

  function clearSearch() {
    setDraft("");
    void navigate({
      to: "/",
      search: buildSearch({ q: "", category, sort }),
      replace: true,
    });
  }

  function toggleFavorite(channelId: bigint) {
    if (favoriteIds.has(channelId.toString())) removeFavorite.mutate(channelId);
    else addFavorite.mutate(channelId);
  }

  const isSearching = (q ?? "").trim().length > 0;
  const hasResults = visibleChannels.length > 0;
  const showSkeleton = activeQuery.isLoading && !activeQuery.data;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6 md:py-10">
      <section data-ocid="browse.section" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="label-eyebrow">Catálogo en directo</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Canales de televisión
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Explora la parrilla completa, filtra por categoría y encuentra tu
              próxima emisión en segundos.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 md:w-auto"
          >
            <div className="relative min-w-0 flex-1 md:w-72">
              <Radio
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={draft}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por nombre…"
                aria-label="Buscar canales por nombre"
                data-ocid="browse.search_input"
                className="h-11 rounded-full border-border bg-muted/50 pl-9 pr-9"
              />
              {draft ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Limpiar búsqueda"
                  data-ocid="browse.search_clear_button"
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-quick hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <Button
              type="submit"
              data-ocid="browse.search_button"
              className="h-11 rounded-full"
            >
              Buscar
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            value={category}
            onChange={handleCategoryChange}
            className="lg:flex-1"
          />

          <fieldset
            aria-label="Ordenar canales"
            className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/40 p-1"
          >
            <ArrowDownWideNarrow
              className="ml-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {SORT_OPTIONS.map((option) => {
              const isActive = option.value === sort;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  data-ocid={`browse.sort.${option.value}`}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "bg-card text-foreground shadow-subtle"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </fieldset>
        </div>
      </section>

      <section aria-live="polite" className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {showSkeleton
              ? "Sintonizando…"
              : `${visibleChannels.length} ${
                  visibleChannels.length === 1 ? "canal" : "canales"
                }`}
          </p>
          {isSearching ? (
            <p className="truncate text-sm text-muted-foreground">
              Resultados para{" "}
              <span className="font-medium text-foreground">“{q}”</span>
            </p>
          ) : null}
        </div>

        {showSkeleton ? (
          <div
            data-ocid="browse.loading_state"
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
        ) : activeQuery.isError ? (
          <EmptyState
            data-ocid="browse.error_state"
            icon={Tv}
            title="No pudimos cargar la parrilla"
            description="La señal del catálogo se interrumpió. Vuelve a intentarlo en unos segundos."
            action={
              <Button
                type="button"
                data-ocid="browse.retry_button"
                onClick={() => void activeQuery.refetch()}
                className="rounded-full"
              >
                Reintentar
              </Button>
            }
          />
        ) : hasResults ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleChannels.map((channel, index) => (
              <ChannelCard
                key={channel.id.toString()}
                channel={channel}
                index={index}
                isFavorite={favoriteIds.has(channel.id.toString())}
                onToggleFavorite={isAuthenticated ? toggleFavorite : undefined}
                favoriteDisabled={
                  addFavorite.isPending || removeFavorite.isPending
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            data-ocid="browse.empty_state"
            icon={SearchX}
            title={
              isSearching
                ? "Ningún canal coincide con tu búsqueda"
                : "No hay canales en esta categoría"
            }
            description={
              isSearching
                ? `No encontramos emisiones para “${q}”. Prueba con otro nombre o cambia de categoría.`
                : `Todavía no hay señales en ${categoryLabel(
                    category === "all" ? Category.news : category,
                  )}. Explora el catálogo completo mientras tanto.`
            }
            action={
              <Button
                type="button"
                data-ocid="browse.reset_button"
                onClick={() => {
                  clearSearch();
                  handleCategoryChange("all");
                }}
                className="rounded-full"
              >
                Ver todos los canales
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
