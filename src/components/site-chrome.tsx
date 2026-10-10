import { Link } from "@tanstack/react-router";
import { Coffee } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/create", label: "Create" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
            <Coffee className="h-5 w-5" />
          </span>
          SipStory <span className="italic text-accent">AI</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <div>
          <p className="font-serif text-lg font-bold text-primary">SipStory AI ☕</p>
          <p className="text-sm text-muted-foreground">Every sip deserves its own story.</p>
        </div>
        <nav className="flex gap-5 text-sm font-semibold text-muted-foreground">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
