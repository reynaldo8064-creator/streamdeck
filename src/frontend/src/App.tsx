import { AppLayout } from "@/components/layout/AppLayout";
import BrowsePage from "@/pages/BrowsePage";
import ChannelDetailPage from "@/pages/ChannelDetailPage";
import FavoritesPage from "@/pages/FavoritesPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

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

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
