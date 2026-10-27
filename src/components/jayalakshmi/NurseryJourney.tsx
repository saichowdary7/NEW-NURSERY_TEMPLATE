import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeafMark } from "./motion";

// Real nursery footage (Mixkit License) — see src/assets/footage.md.
const chapters = [
  { id: "flowering", kicker: "Flowering plants", title: <>Colour that <em>keeps blooming.</em></>, text: "Hanging baskets, vinca, begonia and bougainvillea, raised under shade-net until every bud is ready to open.", tags: ["Vinca", "Begonia", "Bougainvillea", "Hibiscus"], video: "/videos/flowering.mp4", poster: "/videos/flowering.jpg" },
  { id: "seasonal", kicker: "Seasonal blooms", title: <>Beds of <em>sunshine</em>, every season.</>, text: "Chrysanthemum, marigold, petunia and more, grown in tight rows so your garden can bloom on schedule.", tags: ["Chrysanthemum", "Marigold", "Petunia", "Dianthus"], video: "/videos/seasonal-blooms.mp4", poster: "/videos/seasonal-blooms.jpg" },
  { id: "ornamental", kicker: "Ornamentals & palms", title: <>Soft fronds, <em>sculpted greens.</em></>, text: "Areca and parlour palms, ferns, crotons and foliage plants for verandas, lobbies and living rooms.", tags: ["Areca palm", "Parlour palm", "Ferns", "Crotons"], video: "/videos/ornamental-palms.mp4", poster: "/videos/ornamental-palms.jpg" },
  { id: "avenue", kicker: "Avenue & landscape trees", title: <>Tall stock for <em>long avenues.</em></>, text: "Hardened saplings and tall cane stock for avenues, campuses, farmhouses and landscape projects, in any quantity.", tags: ["Avenue saplings", "Dracaena canes", "Shade trees", "Bulk orders"], video: "/videos/avenue-trees.mp4", poster: "/videos/avenue-trees.jpg" },
];

function ChapterFilm({ src, poster, label, active, near }: { src: string; poster: string; label: string; active: boolean; near: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !reduce) void v.play().catch(() => undefined);
    else v.pause();
  }, [active, reduce]);
  // On portrait phones the whole frame sits near the top over a blurred fill (see .fit-film).
  return (
    <>
      <img src={poster} alt="" aria-hidden="true" className="film-backdrop" />
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload={near ? "auto" : "none"} aria-label={label} style={{ "--fit-y": "14%" } as React.CSSProperties} className="fit-film relative h-full w-full object-cover" />
    </>
  );
}

function Layer({ i, n, p, active, near, chapter }: { i: number; n: number; p: MotionValue<number>; active: boolean; near: boolean; chapter: (typeof chapters)[number] }) {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const first = i === 0;
  const last = i === n - 1;
  const start = i / n;
  const end = (i + 1) / n;
  // Keyframe offsets must stay inside 0–1 (Framer hands these to native scroll timelines).
  const enterAt = Math.max(0, start - 0.6 / n);
  const textIn = [Math.max(0, start - 0.25 / n), start + 0.1 / n];
  const textOut = [end - 0.3 / n, end - 0.05 / n];
  // Each chapter opens over the last like a curtain lifting, footage settling forward from depth.
  const clipPath = useTransform(p, [enterAt, Math.max(start, 0.001)], first || reduce ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(p, [enterAt, end], reduce || mobile ? [1, 1] : [first ? 1.15 : 1.35, 1]);
  const rotateX = useTransform(p, [enterAt, Math.max(start, 0.001)], reduce || first ? [0, 0] : [-12, 0]);
  // Copy drifts up in 3D and hands off to the next chapter.
  const textOpacity = useTransform(p, [...textIn, ...textOut], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const textY = useTransform(p, [...textIn, textOut[1]!], reduce ? [0, 0, 0] : [first ? 0 : 80, 0, last ? 0 : -60]);
  const textRotate = useTransform(p, textIn, reduce || first ? [0, 0] : [25, 0]);

  return (
    <motion.div style={{ clipPath, zIndex: i }} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ scale, rotateX, transformOrigin: "50% 100%" }} className="absolute inset-0">
        <ChapterFilm src={chapter.video} poster={chapter.poster} label={chapter.kicker} active={active} near={near} />
      </motion.div>
      <div className="journey-scrim pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 flex items-end md:items-center" style={{ perspective: 900 }}>
        <motion.div style={{ opacity: textOpacity, y: textY, rotateX: textRotate, transformOrigin: "50% 100%" }} className="film-text mx-auto w-full max-w-7xl px-6 pb-16 text-film-ink md:px-12 md:pb-0">
          <p className="font-serif text-5xl text-film-ink/70 md:text-8xl">0{i + 1}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em]">{chapter.kicker}</p>
          <h2 className="mt-3 max-w-2xl text-4xl leading-[1.02] sm:text-6xl md:mt-4 md:text-7xl">{chapter.title}</h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-film-ink/90 sm:text-lg md:mt-5">{chapter.text}</p>
          <ul className="mt-5 flex max-w-xl flex-wrap gap-2 md:mt-6">
            {chapter.tags.map((t) => <li key={t} className="rounded-full border border-film-ink/40 bg-film-ink/10 px-3.5 py-1.5 text-xs backdrop-blur-sm">{t}</li>)}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function NurseryJourney() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const n = chapters.length;
  const [active, setActive] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n + 0.15)))));
  const bar = useTransform(p, [0, 1], [0, 1]);
  const barOpacity = useTransform(p, [0.94, 1], [1, 0]);

  if (reduce) {
    return (
      <section id="journey" aria-label="Walk through the nursery" className="space-y-4 bg-primary p-4">
        {chapters.map((c, i) => (
          <div key={c.id} className="relative h-[80svh] overflow-hidden rounded-3xl">
            <img src={c.poster} alt={c.kicker} className="absolute inset-0 h-full w-full object-cover" />
            <div className="journey-scrim absolute inset-0" />
            <div className="film-text absolute inset-x-0 bottom-0 p-8 text-film-ink">
              <p className="text-xs uppercase tracking-[0.3em]">0{i + 1} · {c.kicker}</p>
              <h2 className="mt-3 text-4xl">{c.title}</h2>
              <p className="mt-3 max-w-md">{c.text}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="journey" ref={ref} aria-label="Walk through the nursery" className="relative bg-primary" style={{ height: `${n * 120}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden" style={{ perspective: 1400 }}>
        {chapters.map((c, i) => (
          <Layer key={c.id} i={i} n={n} p={p} chapter={c} active={active === i} near={Math.abs(active - i) <= 1} />
        ))}

        <div className="pointer-events-none absolute left-6 top-24 z-20 flex items-center gap-3 text-film-ink md:left-12 md:top-28">
          <LeafMark className="h-4 w-4" />
          <span className="text-[0.7rem] uppercase tracking-[0.3em]">Walk the nursery</span>
        </div>

        <nav aria-label="Nursery sections" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          {chapters.map((c, i) => (
            <button key={c.id} onClick={() => {
              const el = ref.current;
              if (!el) return;
              const top = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * ((i + 0.2) / n);
              window.scrollTo({ top, behavior: "smooth" });
            }} className="group flex items-center justify-end gap-3 text-right text-film-ink" aria-current={active === i}>
              <span className={`film-text text-xs transition-all duration-500 ${active === i ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`}>{c.kicker}</span>
              <span className={`block h-2 rounded-full bg-film-ink transition-all duration-500 ${active === i ? "w-8" : "w-2 opacity-60"}`} />
            </button>
          ))}
        </nav>

        <motion.div style={{ opacity: barOpacity }} className="absolute inset-x-0 bottom-0 z-20 h-1 bg-film-ink/20">
          <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-film-ink" />
        </motion.div>
      </div>
    </section>
  );
}
