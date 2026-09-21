import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

/** Shared shell: sticky header, content canvas and attribution footer. */
export function AppLayout({ children }: AppLayoutProps) {
  const year = new Date().getFullYear();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main data-ocid="page" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            StreamDeck · Señal de catálogo activa
          </p>
          <p className="text-sm text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-quick hover:text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <MobileNav />
    </div>
  );
}
