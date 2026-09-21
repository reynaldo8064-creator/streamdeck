import { Link } from "@tanstack/react-router";
import { Compass, Star } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { to: "/", label: "Explorar", icon: Compass },
  { to: "/favorites", label: "Favoritos", icon: Star },
] as const;

/** Fixed bottom navigation for small screens. */
export function MobileNav() {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-[1400px] items-stretch">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                data-ocid={`mobile_nav.${item.label.toLowerCase()}.link`}
                activeOptions={{ exact: item.to === "/" }}
                className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                activeProps={{ className: "text-primary" }}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
