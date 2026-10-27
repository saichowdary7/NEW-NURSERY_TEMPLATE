import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import home from "@/assets/svc-home.jpg";
import office from "@/assets/svc-office.jpg";
import landscape from "@/assets/svc-landscape.jpg";
import care from "@/assets/svc-care.jpg";
import type { EnquiryType } from "@/config/site";
import { Reveal } from "./motion";
import { CinematicVideo } from "./CinematicVideo";

// Real footage (Mixkit License) — see src/assets/footage.md.
const film = { url: "/videos/watering.mp4" };
const poster = { url: "/videos/watering.jpg" };

export const services: { title: string; text: string; image: string; topic: EnquiryType }[] = [
  { title: "Home Gardening", text: "Bring warmth and greenery into your living spaces.", image: home, topic: "Home Gardening" },
  { title: "Office Green Solutions", text: "Create refreshing and inspiring workspaces.", image: office, topic: "Office Plants" },
  { title: "Landscape Design", text: "Transform balconies, gardens, and outdoor spaces.", image: landscape, topic: "Landscape Design" },
  { title: "Plant Care Guidance", text: "Get practical advice for healthier, happier plants.", image: care, topic: "Plant Care Advice" },
];

export function ServicesSection({ onEnquire }: { onEnquire: (t: EnquiryType, msg?: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Footage settles from a gentle zoom as the card scrolls through view.
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.18, 1]);

  return (
    <section id="services" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="grid items-end gap-5 md:grid-cols-[1fr_auto] md:gap-10">
          <div>
            <p className="eyebrow">Grown with care</p>
            <h2 className="mt-4 text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">Our <em className="text-primary">Services</em></h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">From the first leaf to a thriving green space. Thoughtful care, every step of the way.</p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <Reveal className="h-full">
            <div ref={ref} className="relative aspect-video h-full overflow-hidden rounded-4xl bg-secondary shadow-soft lg:aspect-auto lg:min-h-120">
              <div className="absolute inset-0">
                <CinematicVideo src={film.url} poster={poster.url} label="Watering a young plant" scale={scale} />
              </div>
              <div className="film-scrim pointer-events-none absolute inset-0" />
              <div className="film-text pointer-events-none absolute inset-x-0 bottom-0 p-6 pr-20 text-film-ink sm:p-8 sm:pr-24">
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-film-ink/85">From our nursery</p>
                <p className="mt-2 font-serif text-2xl italic leading-tight sm:text-3xl">A little care. A lot of life.</p>
              </div>
            </div>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {services.map((s, i) => (
              <li key={s.title} className="h-full">
                <Reveal delay={i * 0.08} className="h-full">
                  <motion.button
                    type="button"
                    onClick={() => onEnquire(s.topic, `I'd like to know more about your ${s.title} service.`)}
                    whileHover={reduce ? {} : { y: -4 }}
                    transition={{ duration: 0.35 }}
                    className="group flex h-full w-full items-center gap-4 rounded-3xl border border-border bg-card p-3 text-left shadow-card transition-colors hover:border-sage sm:p-4"
                  >
                    <span className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                      <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs text-sage">0{i + 1}</span>
                      <span className="block font-serif text-xl leading-snug text-foreground sm:text-2xl">{s.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{s.text}</span>
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center self-center rounded-full bg-accent text-primary transition-transform duration-500 group-hover:rotate-45" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </motion.button>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
