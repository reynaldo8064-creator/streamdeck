import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";

import { AppLayout } from "@/components/layout/AppLayout";
import BrowsePage from "@/pages/BrowsePage";
import ChannelDetailPage from "@/pages/ChannelDetailPage";
import FavoritesPage from "@/pages/FavoritesPage";

export interface RenderAppOptions {
  /** Initial URL, e.g. "/?category=sports". */
  initialUrl?: string;
}

/** Build the same route tree as App.tsx, but with a memory history. */
function buildRouter(initialUrl: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  });

  const browseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    validateSearch: (
      search: Record<string, unknown>,
    ): { q?: string; category?: string; sort?: string } => ({
      q:
        typeof search.q === "string" && search.q.length > 0
          ? search.q
          : undefined,
      category:
        typeof search.category === "string" && search.category.length > 0
          ? search.category
          : undefined,
      sort:
        typeof search.sort === "string" && search.sort.length > 0
          ? search.sort
          : undefined,
    }),
    component: BrowsePage,
  });

  const channelDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/channel/$channelId",
    component: ChannelDetailPage,
  });

  const favoritesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/favorites",
    component: FavoritesPage,
  });

  const routeTree = rootRoute.addChildren([
    browseRoute,
    channelDetailRoute,
    favoritesRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
  });
}

/**
 * Render the StreamDeck route tree with a fresh QueryClient. The auth and actor
 * hooks are replaced with local fakes by the test file, so no Internet Identity
 * popup or canister agent is ever constructed.
 * Returns the router so tests can assert on the resolved location.
 */
export function renderApp({
  initialUrl = "/",
}: RenderAppOptions): RenderResult & {
  router: ReturnType<typeof buildRouter>;
} {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  const router = buildRouter(initialUrl);

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router };
}
