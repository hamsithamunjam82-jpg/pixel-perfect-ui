import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SipStory AI" },
      { name: "description", content: "Why SipStory AI exists: helping cafés and creators film beautiful drink videos." },
      { property: "og:title", content: "About SipStory AI" },
      { property: "og:description", content: "An AI creative director for cafés, baristas and beverage brands." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-4xl font-bold text-primary md:text-5xl">A little creative director for your café ☕</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        SipStory AI helps cafés, baristas, beverage brands and creators turn any drink into a ready-to-film video plan —
        hooks, script, timed shot list, caption and production notes — for Reels, Shorts and TikTok.
      </p>
      <p className="mt-4 text-muted-foreground">No more staring at a latte wondering what to film.</p>
      <Link to="/create" className="mt-8 inline-flex rounded-full bg-strawberry px-7 py-3 font-bold text-primary-foreground shadow-pink">
        Create My SipStory ✨
      </Link>
    </section>
  );
}
