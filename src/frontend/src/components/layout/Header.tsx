import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Search, Tv } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Explorar" },
  { to: "/favorites", label: "Favoritos" },
] as const;

/** Sticky blurred header: wordmark, primary nav, search entry and auth control. */
export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoggingIn, login, clear } = useInternetIdentity();
  const [query, setQuery] = useState("");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    void navigate({ to: "/", search: { q: trimmed } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 md:gap-6 md:px-6">
        <Link
          to="/"
          data-ocid="nav.link"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-gradient-primary shadow-tally">
            <Tv className="size-4 text-primary-foreground" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Stream<span className="text-primary">Deck</span>
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`nav.${item.label.toLowerCase()}.link`}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-quick hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden min-w-0 flex-1 items-center justify-end md:flex"
        >
          <div className="relative w-full max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar canales…"
              aria-label="Buscar canales"
              data-ocid="nav.search_input"
              className="h-10 rounded-full border-border bg-muted/50 pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              data-ocid="nav.signout_button"
              onClick={() => clear()}
              className="rounded-full"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          ) : (
            <Button
              type="button"
              data-ocid="nav.signin_button"
              disabled={isLoggingIn}
              onClick={() => login()}
              className="rounded-full"
            >
              <LogIn className="size-4" aria-hidden="true" />
              <span className={cn(isLoggingIn && "opacity-80")}>
                {isLoggingIn ? "Conectando…" : "Iniciar sesión"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
