import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, Hash, Heart, Sparkles, Video, Zap } from "lucide-react";
import hero from "@/assets/hero-drink.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SipStory AI — Every sip deserves its own story" },
      { name: "description", content: "Turn your favourite drinks into scroll-stopping Reels, Shorts and TikToks with AI-made hooks, scripts and shot lists." },
      { property: "og:title", content: "SipStory AI — Every sip deserves its own story" },
      { property: "og:description", content: "AI video plans for cafés, baristas and beverage creators." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Zap, title: "Catchy Hooks", text: "Grab attention in the first three seconds." },
  { icon: Clapperboard, title: "Creative Scripts", text: "Get a complete, ready-to-read video script." },
  { icon: Video, title: "Aesthetic Shot Lists", text: "Know exactly what to film, second by second." },
  { icon: Hash, title: "Captions & Hashtags", text: "Make every post ready to share." },
];

const steps = ["Choose your drink", "Customize your vibe", "Generate your story"];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-blush">
        <Sparkles className="animate-floaty absolute left-[8%] top-16 h-6 w-6 text-accent" />
        <Heart className="animate-floaty absolute right-[45%] top-24 h-4 w-4 text-accent [animation-delay:1s]" />
        <Sparkles className="animate-floaty absolute bottom-16 left-[40%] h-5 w-5 text-matcha [animation-delay:2s]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent shadow-soft">
              <Sparkles className="h-3.5 w-3.5" /> AI video planner for drinks
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] text-primary md:text-6xl">
              Every sip deserves its <em className="text-accent">own story.</em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Turn your favourite drinks into scroll-stopping videos with a little help from AI.
            </p>
            <Link
              to="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-strawberry px-8 py-4 text-base font-bold text-primary-foreground shadow-pink transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              Create My SipStory ✨
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-secondary" />
            <img
              src={hero}
              alt="Iced strawberry matcha latte on a marble café table"
              width={1024}
              height={1280}
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft"
            />
            <div className="absolute -bottom-5 -left-6 rounded-2xl bg-card px-4 py-3 text-sm shadow-soft">
              <p className="font-serif font-bold text-primary">0–3s · The Pour Reveal</p>
              <p className="text-xs text-muted-foreground">“Wait for the swirl…” 🍓</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl">Everything you need to film</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-primary">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5">
        <div className="rounded-[2rem] bg-muted px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-primary">How it works</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className="rounded-full bg-card px-5 py-3 font-semibold shadow-soft">
                  <span className="mr-2 font-serif text-accent">{i + 1}.</span>
                  {s}
                </div>
                {i < steps.length - 1 && <span className="hidden text-2xl text-accent md:inline">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
