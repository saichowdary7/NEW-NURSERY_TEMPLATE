import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { CinematicVideo } from "./CinematicVideo";
import { scrollToId } from "./Navbar";

// Real nursery walk-through (Mixkit License) — see src/assets/footage.md.
const film = { src: "/videos/nursery-walk.mp4", poster: "/videos/nursery-walk.jpg" };
const nameLines = ["Taraka", "Jayalakshmi"];
const kinds = ["Flowering plants", "Ornamentals", "Avenue trees", "Palms", "Fruit plants"];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = <T,>(a: T, b: T) => (reduce ? [a, a] : [a, b]);

  // The film recedes into an arched frame while the footage counter-zooms, giving real depth.
  const inset = useTransform(p, [0, 0.75], still(0, 7));
  const radius = useTransform(p, [0, 0.75], still(0, 14));
  const clipPath = useTransform([inset, radius], ([i = 0, r = 0]: number[]) => `inset(${i}% ${i}% ${i}% ${i}% round ${r}rem ${r}rem ${r / 7}rem ${r / 7}rem)`);
  const filmScale = useTransform(p, [0, 1], mobile ? [1, 1] : still(1.18, 1));
  // Headline tilts back into the scene and dissolves.
  const rotateX = useTransform(p, [0, 0.5], still(0, 38));
  const z = useTransform(p, [0, 0.5], still(0, -260));
  const textOpacity = useTransform(p, [0, 0.35, 0.5], [1, 1, reduce ? 1 : 0]);
  // Closing line rises in the framed film.
  const outroOpacity = useTransform(p, [0.5, 0.75], [0, 1]);
  const outroY = useTransform(p, [0.5, 0.75], [40, 0]);

  return (
    <section id="home" ref={ref} className="nursery-opening relative bg-background">
      <div className="sticky top-0 h-svh min-h-130 overflow-hidden" style={{ perspective: 1200 }}>
        <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden bg-primary">
          <div className="absolute inset-0">
            <CinematicVideo src={film.src} poster={film.poster} label="Walking through Taraka Jayalakshmi Nursery" autoPlay scale={filmScale} fitY="10%" />
          </div>
          <div className="hero-vignette pointer-events-none absolute inset-0" />

          <motion.div style={{ opacity: outroOpacity, y: outroY }} className="film-text pointer-events-none absolute inset-x-0 bottom-[14%] z-10 px-6 text-center text-film-ink">
            <p className="eyebrow text-film-ink/90!">Grown in open air, under our own shade-nets</p>
            <p className="mx-auto mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-5xl">Thousands of plants, raised by hand, <em>ready to take root with you.</em></p>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ rotateX, z, opacity: textOpacity, transformOrigin: "50% 100%" }}
          className="film-text relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 pt-28 text-film-ink md:px-10 md:pb-24"
        >
          <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="mb-4 hidden text-xs uppercase tracking-[0.3em] sm:block">
            Plants bring life
          </motion.p>
          <h1 className="text-[3.3rem] leading-[0.92] sm:text-7xl lg:text-[112px]" aria-label="Taraka Jayalakshmi Nursery" style={{ perspective: 600 }}>
            {nameLines.map((line, li) => (
              <span key={line} aria-hidden="true" className="flex">
                {line.split("").map((l, i) => (
                  <motion.span key={i} className="inline-block"
                    initial={reduce ? false : { opacity: 0, y: "60%", rotateX: -80 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.1, delay: 0.35 + (li * 6 + i) * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                    {l}
                  </motion.span>
                ))}
              </span>
            ))}
            <motion.span aria-hidden="true" className="mt-1 block font-serif text-3xl italic text-film-ink/90 sm:text-5xl lg:text-6xl"
              initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }}>
              Nursery
            </motion.span>
          </h1>
          <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }} className="mt-5 max-w-xl font-serif text-2xl leading-snug sm:text-4xl">
            Where beautiful things <em>take root.</em>
          </motion.p>
          <motion.ul initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.25 }} className="mt-6 flex flex-wrap gap-2">
            {kinds.map((k) => (
              <li key={k} className="rounded-full border border-film-ink/40 bg-film-ink/10 px-3.5 py-1.5 text-xs tracking-wide backdrop-blur-sm">{k}</li>
            ))}
          </motion.ul>
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.45 }} className="mt-8 flex flex-wrap items-center gap-4">
            <Button onClick={() => scrollToId("journey")} size="lg" variant="secondary" className="h-12 rounded-full bg-background text-primary shadow-none">Walk the nursery <ArrowUpRight /></Button>
            <Button onClick={() => scrollToId("plants")} size="lg" variant="outline" className="h-12 rounded-full border-film-ink/60 bg-transparent text-film-ink hover:bg-background hover:text-primary">Explore our plants</Button>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: textOpacity }} className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-film-ink">
          <span>Scroll</span>
          <motion.span animate={reduce ? { y: 0 } : { y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}><ArrowDown className="h-4 w-4" /></motion.span>
        </motion.div>
      </div>
    </section>
  );
}
