import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Camera, Clapperboard, Copy, Hash, Lightbulb, Loader2, Palette, RefreshCw, RotateCcw, Sparkles, Wand2, Zap,
} from "lucide-react";
import { generatePlan } from "@/lib/sipstory.functions";
import {
  AESTHETICS, AUDIENCES, CATEGORIES, DURATIONS, FORMATS, PLATFORMS, inputSchema,
  type Plan, type PlanInput, type RegenMode,
} from "@/lib/sipstory-schema";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a SipStory — AI drink video planner" },
      { name: "description", content: "Enter your drink and vibe to get hooks, a script, a timed shot list and captions." },
      { property: "og:title", content: "Create a SipStory" },
      { property: "og:description", content: "Generate a ready-to-film drink video plan in seconds." },
    ],
  }),
  component: CreatePage,
});

const empty: PlanInput = {
  drinkName: "", category: "Coffee", platform: "Instagram Reels", duration: 30,
  aesthetic: "Aesthetic & Cinematic", audience: "Coffee lovers", format: "Voiceover", extras: "",
};
const loadingLines = ["Grinding creative ideas…", "Adding a little latte magic…", "Pouring your perfect script…", "Sprinkling some creativity…"];

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied ☕`);
  } catch {
    toast.error("Couldn't copy — please try again.");
  }
}

function planToText(p: Plan) {
  return [
    `🎬 ${p.concept.title}`, p.concept.oneLiner, `Mood: ${p.concept.mood}`, `Style: ${p.concept.visualStyle}`, p.concept.whyItWorks,
    "", "HOOKS", ...p.hooks.map((h) => `• [${h.type}] ${h.text}`),
    "", "SCRIPT", ...p.script.map((s) => `${s.cue}: ${s.line}`),
    "", "SHOTS", ...p.shots.map((s) => `${s.start}–${s.end}s | ${s.onScreen} | ${s.camera} | ${s.action} | ${s.voiceOrText} | ${s.soundOrTransition}`),
    "", "CAPTION", p.caption.text, p.caption.hashtags.join(" "),
    "", "PRODUCTION NOTES",
    `Lighting: ${p.productionNotes.lighting}`, `Props: ${p.productionNotes.props}`, `Setting: ${p.productionNotes.setting}`,
    `Camera: ${p.productionNotes.cameraAngles}`, `Transitions: ${p.productionNotes.transitions}`, `Music: ${p.productionNotes.music}`,
    ...p.productionNotes.filmingTips.map((t) => `• ${t}`),
    "", "ALTERNATIVES", ...p.alternatives.map((a) => `• ${a.title}: ${a.idea}`),
  ].join("\n");
}

function CreatePage() {
  const [form, setForm] = useState<PlanInput>(empty);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState<RegenMode | null>(null);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setLine((l) => (l + 1) % loadingLines.length), 1800);
    return () => clearInterval(t);
  }, [busy]);

  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function run(mode: RegenMode, input = form) {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setError(null);
    setBusy(mode);
    try {
      const res = await generatePlan({ data: { input: parsed.data, mode, previous: mode === "full" ? null : plan } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const next = res.plan;
      setPlan((prev) => {
        if (!prev || mode === "full" || mode === "aesthetic") return next;
        if (mode === "hooks") return { ...prev, hooks: next.hooks };
        if (mode === "script") return { ...prev, script: next.script, shots: next.shots };
        return { ...prev, caption: next.caption };
      });
      toast.success(mode === "full" ? "Your SipStory is ready ✨" : "Fresh version brewed ☕");
      if (mode === "full" || mode === "aesthetic") setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function differentAesthetic() {
    const options = AESTHETICS.filter((a) => a !== form.aesthetic);
    const pick = options[Math.floor(Math.random() * options.length)] ?? AESTHETICS[0];
    const next = { ...form, aesthetic: pick };
    setForm(next);
    toast(`Trying a ${pick} vibe…`);
    run("aesthetic", next);
  }

  function newProject() {
    setForm(empty);
    setPlan(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-blush">
      <section className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-center text-4xl font-bold text-primary md:text-5xl">Let's create something brew-tiful ☕</h1>
        <p className="mt-3 text-center text-muted-foreground">Tell us about your drink and we'll plan the whole video.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); run("full"); }}
          className="mt-10 space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-8"
        >
          <Field label="Drink name *">
            <input
              value={form.drinkName}
              onChange={(e) => set("drinkName", e.target.value)}
              placeholder="e.g. Iced Caramel Latte"
              className="w-full rounded-full border border-input bg-background px-5 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/40"
            />
            {error && <p className="mt-2 text-sm font-semibold text-destructive">🍓 {error}</p>}
          </Field>
          <Pills label="Drink category" options={CATEGORIES} value={form.category} onChange={(v) => set("category", v)} />
          <Pills label="Social platform" options={PLATFORMS} value={form.platform} onChange={(v) => set("platform", v)} />
          <Pills label="Video duration" options={DURATIONS} value={form.duration} onChange={(v) => set("duration", v)} render={(d) => `${d}s`} />
          <Pills label="Video aesthetic" options={AESTHETICS} value={form.aesthetic} onChange={(v) => set("aesthetic", v)} />
          <Pills label="Target audience" options={AUDIENCES} value={form.audience} onChange={(v) => set("audience", v)} />
          <Pills label="Video format" options={FORMATS} value={form.format} onChange={(v) => set("format", v)} />
          <Field label="Extra details (optional)">
            <textarea
              value={form.extras}
              onChange={(e) => set("extras", e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ingredients, toppings, brand name, mood, campaign goals…"
              className="w-full rounded-3xl border border-input bg-background px-5 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/40"
            />
          </Field>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!!busy}
              className="animate-shimmer flex-1 rounded-full bg-strawberry px-8 py-4 text-lg font-bold text-primary-foreground shadow-pink transition hover:-translate-y-0.5 disabled:opacity-70"
            >
              {busy === "full" ? <span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> {loadingLines[line]}</span> : "Brew My Story ✨"}
            </button>
            <button type="button" onClick={() => { setForm(empty); setError(null); }} className="rounded-full border border-border px-6 py-4 font-semibold text-muted-foreground transition hover:bg-muted">
              Reset form
            </button>
          </div>
        </form>
      </section>

      {busy && busy !== "full" && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-card px-5 py-3 text-sm font-semibold shadow-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" /> {loadingLines[line]}
        </div>
      )}

      {plan && <Results plan={plan} busy={busy} run={run} differentAesthetic={differentAesthetic} newProject={newProject} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-primary">{label}</span>
      {children}
    </label>
  );
}

function Pills<T extends string | number>({ label, options, value, onChange, render }: {
  label: string; options: readonly T[]; value: T; onChange: (v: T) => void; render?: (v: T) => string;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-primary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={String(o)}
            onClick={() => onChange(o)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              o === value ? "border-accent bg-secondary text-foreground shadow-pink" : "border-border bg-background text-muted-foreground hover:border-accent"
            }`}
          >
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, onCopy, action, children }: {
  icon: typeof Zap; title: string; onCopy?: () => void; action?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-primary">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-accent"><Icon className="h-5 w-5" /></span>
          {title}
        </h2>
        <div className="flex gap-2">
          {action}
          {onCopy && <SmallBtn onClick={onCopy}><Copy className="h-4 w-4" /> Copy</SmallBtn>}
        </div>
      </div>
      {children}
    </section>
  );
}

function SmallBtn({ onClick, children, disabled }: { onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-secondary disabled:opacity-50">
      {children}
    </button>
  );
}

function Results({ plan, busy, run, differentAesthetic, newProject }: {
  plan: Plan; busy: RegenMode | null; run: (m: RegenMode) => void; differentAesthetic: () => void; newProject: () => void;
}) {
  const p = plan;
  const n = p.productionNotes;
  return (
    <div id="results" className="mx-auto max-w-5xl space-y-6 px-5 pb-10">
      <div className="flex flex-wrap justify-center gap-2">
        <SmallBtn onClick={() => copy(planToText(p), "Full plan")}><Copy className="h-4 w-4" /> Copy full plan</SmallBtn>
        <SmallBtn onClick={differentAesthetic} disabled={!!busy}><Palette className="h-4 w-4" /> Different aesthetic</SmallBtn>
        <SmallBtn onClick={newProject}><RotateCcw className="h-4 w-4" /> New project</SmallBtn>
      </div>

      <Card icon={Sparkles} title="Video Concept" onCopy={() => copy(`${p.concept.title}\n${p.concept.oneLiner}\nMood: ${p.concept.mood}\nStyle: ${p.concept.visualStyle}\n${p.concept.whyItWorks}`, "Concept")}>
        <h3 className="text-3xl font-bold italic text-accent">{p.concept.title}</h3>
        <p className="mt-2 text-lg">{p.concept.oneLiner}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">Mood · {p.concept.mood}</span>
          <span className="rounded-full bg-matcha/40 px-3 py-1 text-sm font-semibold">Style · {p.concept.visualStyle}</span>
        </div>
        <p className="mt-4 text-muted-foreground">{p.concept.whyItWorks}</p>
      </Card>

      <Card icon={Zap} title="Three Hooks" onCopy={() => copy(p.hooks.map((h) => h.text).join("\n"), "Hooks")}
        action={<SmallBtn onClick={() => run("hooks")} disabled={!!busy}><RefreshCw className={`h-4 w-4 ${busy === "hooks" ? "animate-spin" : ""}`} /> New hooks</SmallBtn>}>
        <div className="grid gap-4 md:grid-cols-3">
          {p.hooks.map((h, i) => (
            <div key={i} className="rounded-3xl bg-muted p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{h.type}</p>
              <p className="mt-2 font-serif text-lg">“{h.text}”</p>
            </div>
          ))}
        </div>
      </Card>

      <Card icon={Clapperboard} title="Video Script" onCopy={() => copy(p.script.map((s) => `${s.cue}: ${s.line}`).join("\n"), "Script")}
        action={<SmallBtn onClick={() => run("script")} disabled={!!busy}><RefreshCw className={`h-4 w-4 ${busy === "script" ? "animate-spin" : ""}`} /> Regenerate</SmallBtn>}>
        <ol className="space-y-3">
          {p.script.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="w-28 shrink-0 text-sm font-bold text-accent">{s.cue}</span>
              <span>{s.line}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card icon={Camera} title="Shot Breakdown" onCopy={() => copy(p.shots.map((s) => `${s.start}–${s.end}s: ${s.action} (${s.camera}) — ${s.voiceOrText}`).join("\n"), "Shot list")}>
        <ol className="relative space-y-5 border-l-2 border-secondary pl-6">
          {p.shots.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-card bg-accent" />
              <p className="font-serif text-lg font-bold text-primary">{s.start}–{s.end}s · {s.action}</p>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <Row k="On screen" v={s.onScreen} />
                <Row k="Camera" v={s.camera} />
                <Row k="Voice / text" v={s.voiceOrText} />
                <Row k="Sound / transition" v={s.soundOrTransition} />
              </dl>
            </li>
          ))}
        </ol>
      </Card>

      <Card icon={Hash} title="Caption & Hashtags" onCopy={() => copy(`${p.caption.text}\n\n${p.caption.hashtags.join(" ")}`, "Caption")}
        action={<SmallBtn onClick={() => run("caption")} disabled={!!busy}><RefreshCw className={`h-4 w-4 ${busy === "caption" ? "animate-spin" : ""}`} /> New caption</SmallBtn>}>
        <p className="whitespace-pre-line">{p.caption.text}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.caption.hashtags.map((h) => <span key={h} className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary">{h}</span>)}
        </div>
      </Card>

      <Card icon={Lightbulb} title="Production Notes" onCopy={() => copy(`Lighting: ${n.lighting}\nProps: ${n.props}\nSetting: ${n.setting}\nCamera: ${n.cameraAngles}\nTransitions: ${n.transitions}\nMusic: ${n.music}\n${n.filmingTips.map((t) => `• ${t}`).join("\n")}`, "Production notes")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([["💡 Lighting", n.lighting], ["🍓 Props", n.props], ["🪴 Setting", n.setting], ["🎥 Camera", n.cameraAngles], ["✨ Transitions", n.transitions], ["🎵 Music / ASMR", n.music]] as const).map(([k, v]) => (
            <div key={k} className="rounded-3xl bg-muted p-4">
              <p className="text-sm font-bold text-primary">{k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl bg-matcha/30 p-5">
          <p className="font-bold text-matcha-foreground">Beginner filming tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{n.filmingTips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      </Card>

      <Card icon={Wand2} title="Alternative Ideas" onCopy={() => copy(p.alternatives.map((a) => `${a.title}: ${a.idea}`).join("\n"), "Alternatives")}>
        <div className="grid gap-4 md:grid-cols-2">
          {p.alternatives.map((a, i) => (
            <div key={i} className="rounded-3xl border border-border p-5">
              <p className="font-serif text-xl font-bold text-accent">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.idea}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="inline font-bold text-primary">{k}: </dt>
      <dd className="inline text-muted-foreground">{v}</dd>
    </div>
  );
}
