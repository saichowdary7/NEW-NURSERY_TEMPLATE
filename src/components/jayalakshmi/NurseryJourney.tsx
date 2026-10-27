import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { LeafMark } from "./motion";

// Real nursery photographs (Mixkit License) — see src/assets/footage.md.
const chapters = [
  { id: "flowering", kicker: "Flowering plants", title: <>Colour that <em>keeps blooming.</em></>, text: "Hanging baskets, vinca, begonia and bougainvillea, raised under shade-net until every bud is ready to open.", tags: ["Vinca", "Begonia", "Bougainvillea", "Hibiscus"], image: "/images/journey/flowering.jpg", detail: "/images/journey/flowering-2.jpg" },
  { id: "seasonal", kicker: "Seasonal blooms", title: <>Beds of <em>sunshine</em>, every season.</>, text: "Chrysanthemum, marigold, petunia and more, grown in tight rows so your garden can bloom on schedule.", tags: ["Chrysanthemum", "Marigold", "Petunia", "Tulip"], image: "/images/journey/seasonal.jpg", detail: "/images/journey/seasonal-2.jpg" },
  { id: "ornamental", kicker: "Ornamentals & palms", title: <>Soft fronds, <em>sculpted greens.</em></>, text: "Areca and parlour palms, ferns, crotons and foliage plants for verandas, lobbies and living rooms.", tags: ["Areca palm", "Parlour palm", "Schefflera", "Crotons"], image: "/images/journey/ornamental.jpg", detail: "/images/journey/ornamental-2.jpg" },
  { id: "avenue", kicker: "Avenue & landscape trees", title: <>Tall stock for <em>long avenues.</em></>, text: "Hardened saplings and tall cane stock for avenues, campuses, farmhouses and landscape projects, in any quantity.", tags: ["Avenue saplings", "Dracaena canes", "Shade trees", "Bulk orders"], image: "/images/journey/avenue.jpg", detail: "/images/journey/avenue-2.jpg" },
];
type Chapter = (typeof chapters)[number];

// Scroll keyframes for chapter i: [enter start, settled, leave start, gone]. Offsets stay inside 0–1
// because Framer hands these to native scroll timelines.
function frames(i: number, n: number) {
  const start = i / n;
  const end = (i + 1) / n;
  return [Math.max(0, start - 0.35 / n), start + 0.12 / n, end - 0.35 / n, end - 0.05 / n];
}

// Copy hands off without overlap: the old chapter is gone before the next one rises in.
function textFrames(i: number, n: number) {
  const start = i / n;
  const end = (i + 1) / n;
  return [Math.max(0, start - 0.1 / n), start + 0.12 / n, end - 0.32 / n, end - 0.14 / n];
}

function Backdrop({ i, n, p, chapter }: { i: number; n: number; p: MotionValue<number>; chapter: Chapter }) {
  const first = i === 0;
  const last = i === n - 1;
  const opacity = useTransform(p, frames(i, n), [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <img src={chapter.image} alt="" className="h-full w-full scale-125 object-cover blur-2xl brightness-[0.55] saturate-125" />
    </motion.div>
  );
}

function PhotoCards({ i, n, p, chapter }: { i: number; n: number; p: MotionValue<number>; chapter: Chapter }) {
  const reduce = useReducedMotion();
  const first = i === 0;
  const last = i === n - 1;
  const f = frames(i, n);
  const pick = (enter: number, rest: number, leave: number) => (reduce ? [rest, rest, rest, rest] : [first ? rest : enter, rest, rest, last ? rest : leave]);
  // The arch swings in from depth on one side and leaves past the viewer on the other.
  const rotateY = useTransform(p, f, pick(65, 0, -55));
  const z = useTransform(p, f, pick(-700, 0, 280));
  const x = useTransform(p, f, pick(260, 0, -320));
  const opacity = useTransform(p, f, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  // The detail photo floats nearer the viewer and lags slightly, so the pair reads as layered depth.
  const z2 = useTransform(p, f, pick(-400, 140, 560));
  const rotateY2 = useTransform(p, f, pick(50, -10, -75));
  const y2 = useTransform(p, f, pick(120, 0, -140));

  return (
    <motion.div style={{ opacity, transformStyle: "preserve-3d" }} className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div style={{ rotateY, z, x, transformStyle: "preserve-3d" }} className="relative h-full aspect-4/5 max-h-136">
        <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-3xl border border-film-ink/25 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
          <img src={chapter.image} alt={chapter.kicker} loading={first ? "eager" : "lazy"} className="h-full w-full object-cover" />
        </div>
        <motion.div style={{ z: z2, rotateY: rotateY2, y: y2 }} className="absolute -bottom-3 -left-6 aspect-square w-[40%] md:-bottom-6 md:w-[44%] overflow-hidden rounded-2xl border-4 border-film-ink/90 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] md:-left-16">
          <img src={chapter.detail} alt="" loading="lazy" className="h-full w-full object-cover" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ChapterText({ i, n, p, chapter }: { i: number; n: number; p: MotionValue<number>; chapter: Chapter }) {
  const reduce = useReducedMotion();
  const first = i === 0;
  const last = i === n - 1;
  const f = textFrames(i, n);
  const opacity = useTransform(p, f, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, f, reduce ? [0, 0, 0, 0] : [first ? 0 : 70, 0, 0, last ? 0 : -50]);
  const rotateX = useTransform(p, f, reduce ? [0, 0, 0, 0] : [first ? 0 : 30, 0, 0, last ? 0 : -20]);
  return (
    <motion.div style={{ opacity, y, rotateX, transformOrigin: "50% 100%" }} className="film-text absolute inset-x-0 bottom-0 text-film-ink md:bottom-auto md:top-1/2 md:-translate-y-1/2">
      <p className="font-serif text-4xl text-film-ink/70 md:text-7xl">0{i + 1}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.3em]">{chapter.kicker}</p>
      <h2 className="mt-3 max-w-xl text-4xl leading-[1.02] sm:text-5xl md:text-6xl">{chapter.title}</h2>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-film-ink/90 md:mt-5 md:text-lg">{chapter.text}</p>
      <ul className="mt-4 flex max-w-xl flex-wrap gap-2 md:mt-6">
        {chapter.tags.map((t) => <li key={t} className="rounded-full border border-film-ink/40 bg-film-ink/10 px-3 py-1.5 text-xs backdrop-blur-sm">{t}</li>)}
      </ul>
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
  const barOpacity = useTransform(p, [0.94, 1], [1, 0]);
  // Gentle pointer tilt on desktop gives the photo stage physical depth.
  const tiltX = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });

  if (reduce) {
    return (
      <section id="journey" aria-label="Walk through the nursery" className="space-y-4 bg-primary p-4">
        {chapters.map((c, i) => (
          <div key={c.id} className="relative h-[80svh] overflow-hidden rounded-3xl">
            <img src={c.image} alt={c.kicker} className="absolute inset-0 h-full w-full object-cover" />
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
    <section id="journey" ref={ref} aria-label="Walk through the nursery" className="relative bg-primary" style={{ height: `${n * 120}svh` }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        tiltY.set((e.clientX / window.innerWidth - 0.5) * 12);
        tiltX.set((0.5 - e.clientY / window.innerHeight) * 8);
      }}
      onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {chapters.map((c, i) => <Backdrop key={c.id} i={i} n={n} p={p} chapter={c} />)}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/40" />

        <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[1fr_auto] gap-9 px-6 pb-14 pt-28 md:grid-cols-2 md:grid-rows-1 md:items-center md:gap-12 md:px-12 md:py-0">
          <div className="relative h-full md:order-2 md:h-[70vh]" style={{ perspective: 1400 }}>
            <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }} className="absolute inset-0">
              {chapters.map((c, i) => <PhotoCards key={c.id} i={i} n={n} p={p} chapter={c} />)}
            </motion.div>
          </div>
          <div className="relative h-76 sm:h-68 md:order-1 md:h-104" style={{ perspective: 900 }}>
            {chapters.map((c, i) => <ChapterText key={c.id} i={i} n={n} p={p} chapter={c} />)}
          </div>
        </div>

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
          <motion.div style={{ scaleX: p }} className="h-full origin-left bg-film-ink" />
        </motion.div>
      </div>
    </section>
  );
}
