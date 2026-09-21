import { Category } from "@/lib/types";
import { createMockBackend, makeCatalog } from "@/test/mock-backend";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The app's only backend seam is `createActor` from the generated bindings and
 * the two core-infrastructure hooks. Both are replaced with local fakes; no
 * agent, canister, or Internet Identity popup is constructed.
 */
const backendRef = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/backend", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/backend")>();
  return {
    ...actual,
    createActor: () => backendRef.current,
  };
});

const authRef = vi.hoisted(() => ({
  current: { isAuthenticated: false, isLoggingIn: false },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: backendRef.current, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: authRef.current.isAuthenticated,
    isLoggingIn: authRef.current.isLoggingIn,
    login: vi.fn(),
    clear: vi.fn(),
  }),
}));

beforeEach(() => {
  authRef.current = { isAuthenticated: false, isLoggingIn: false };
});

describe("Browse page", () => {
  it("renders the full catalog of 24 channels across all six categories", async () => {
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({});

    // The default route must not be blank: the heading and the count render.
    expect(
      await screen.findByRole("heading", { name: /canales de televisión/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("24 canales")).toBeInTheDocument();

    // Every seeded channel name is present in the grid.
    for (const channel of makeCatalog(24)) {
      expect(screen.getByText(channel.name)).toBeInTheDocument();
    }
  });

  it("filters the grid to matching channels as the user types", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({});
    await screen.findByText("24 canales");

    await user.type(
      screen.getByLabelText("Buscar canales por nombre"),
      "Canal 07",
    );

    await waitFor(() => {
      expect(screen.getByText("1 canal")).toBeInTheDocument();
    });
    expect(screen.getByText("Canal 07")).toBeInTheDocument();
    expect(screen.queryByText("Canal 08")).not.toBeInTheDocument();
  });

  it("reflects the selected category in the URL and preserves it on reload", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    const { router } = renderApp({});
    await screen.findByText("24 canales");

    await user.click(screen.getByRole("button", { name: "Deportes" }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        category: "sports",
      });
    });
    // Four sports channels in the seeded catalog.
    expect(await screen.findByText("4 canales")).toBeInTheDocument();

    // A reload is a fresh render at the same URL: the filter must survive.
    const reloaded = renderApp({ initialUrl: "/?category=sports" });
    await waitFor(() => {
      expect(reloaded.router.state.location.search).toMatchObject({
        category: "sports",
      });
    });
    expect(await screen.findByText("4 canales")).toBeInTheDocument();
  });

  it("sorts by name when the A–Z control is selected", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    const { router } = renderApp({});
    await screen.findByText("24 canales");

    await user.click(screen.getByRole("button", { name: "A–Z" }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: "name" });
    });
    const cards = await screen.findAllByRole("article");
    const names = cards.map(
      (card) => within(card).getByRole("heading").textContent ?? "",
    );
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("shows a no-results state when the search matches nothing", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({});
    await screen.findByText("24 canales");

    await user.type(
      screen.getByLabelText("Buscar canales por nombre"),
      "zzzz-no-existe",
    );

    expect(
      await screen.findByText("Ningún canal coincide con tu búsqueda"),
    ).toBeInTheDocument();
  });
});

describe("Channel detail page", () => {
  it("shows the channel, its now-playing program and the player area", async () => {
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({ initialUrl: "/channel/1" });

    expect(
      await screen.findByRole("heading", { name: "Canal 01" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ahora en Canal 01")).toBeInTheDocument();
    expect(screen.getByText("Después en Canal 01")).toBeInTheDocument();
    expect(screen.getByTestId("channel.player.panel")).toBeInTheDocument();
    expect(screen.getByText("En emisión")).toBeInTheDocument();
  });

  it("renders a not-found state for a non-numeric channel id", async () => {
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({ initialUrl: "/channel/not-a-number" });

    expect(await screen.findByText("Canal no encontrado")).toBeInTheDocument();
  });
});

describe("Favorites", () => {
  it("prompts signed-out users to sign in on the Favorites page", async () => {
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    renderApp({ initialUrl: "/favorites" });

    expect(
      await screen.findByText("Inicia sesión para ver tus favoritos"),
    ).toBeInTheDocument();
  });

  it("favorites a channel and lists it on the Favorites page", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;
    authRef.current = { isAuthenticated: true, isLoggingIn: false };

    const { router } = renderApp({});
    await screen.findByText("24 canales");

    await user.click(
      screen.getByRole("button", { name: "Añadir Canal 01 a favoritos" }),
    );

    await waitFor(() => {
      expect(backend.favorites.has("1")).toBe(true);
    });

    await act(async () => {
      await router.navigate({ to: "/favorites" });
    });

    expect(
      await screen.findByRole("heading", { name: "Favoritos" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Canal 01")).toBeInTheDocument();
    expect(screen.queryByText("Canal 02")).not.toBeInTheDocument();
  });

  it("shows the empty favorites state for a signed-in user with none saved", async () => {
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;
    authRef.current = { isAuthenticated: true, isLoggingIn: false };

    renderApp({ initialUrl: "/favorites" });

    expect(
      await screen.findByText("Todavía no tienes favoritos"),
    ).toBeInTheDocument();
  });
});

describe("Navigation", () => {
  it("navigates between Browse, Favorites and channel detail without a reload", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;
    authRef.current = { isAuthenticated: true, isLoggingIn: false };

    const { router } = renderApp({});
    await screen.findByText("24 canales");

    // Browse -> channel detail via the card link.
    await user.click(screen.getByRole("link", { name: /Canal 01/ }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/channel/1");
    });
    expect(
      await screen.findByRole("heading", { name: "Canal 01" }),
    ).toBeInTheDocument();

    // Detail -> Favorites via the header nav.
    await user.click(screen.getByTestId("nav.favoritos.link"));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/favorites");
    });
    expect(
      await screen.findByRole("heading", { name: "Favoritos" }),
    ).toBeInTheDocument();

    // Favorites -> Browse via the header nav.
    await user.click(screen.getByTestId("nav.explorar.link"));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
    expect(await screen.findByText("24 canales")).toBeInTheDocument();
  });

  it("drives the browse search from the header search entry", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    backendRef.current = backend;

    const { router } = renderApp({});
    await screen.findByText("24 canales");

    await user.type(screen.getByLabelText("Buscar canales"), "Canal 05");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: "Canal 05" });
    });
    expect(await screen.findByText("1 canal")).toBeInTheDocument();
  });
});

describe("Category filter contract", () => {
  it("requests the selected category from the backend", async () => {
    const user = userEvent.setup();
    const backend = createMockBackend(makeCatalog(24));
    const spy = vi.spyOn(backend, "listChannelsByCategory");
    backendRef.current = backend;

    renderApp({});
    await screen.findByText("24 canales");

    await user.click(screen.getByRole("button", { name: "Cine" }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(Category.movies, "popularity");
    });
  });
});
