import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Award, BookOpen, HeartHandshake, Recycle } from "lucide-react";
import about from "@/assets/about.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import { Reveal } from "./motion";

// PLACEHOLDER figures — replace with verified business numbers.
const stats = [
  { v: "500+", l: "Plant varieties" },
  { v: "—", l: "Happy homes (to be confirmed)" },
  { v: "—", l: "Years growing (to be confirmed)" },
];

const values = [
  { i: Award, t: "Quality", d: "Healthy, well-rooted plants, hand-checked before they leave us." },
  { i: Recycle, t: "Sustainability", d: "Thoughtful sourcing and reusable, low-waste packaging." },
  { i: BookOpen, t: "Plant Knowledge", d: "Honest advice on what will truly thrive in your space." },
  { i: HeartHandshake, t: "Personalised Guidance", d: "Recommendations shaped around your light, space and routine." },
];

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce || mobile ? [0, 0] : [-40, 40]);

  return (
    <section id="about" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <div ref={ref} className="relative overflow-hidden rounded-[2rem] shadow-soft">
          <motion.img style={{ y, scale: 1.12 }} src={about} alt="Sunlit living room filled with plants" loading="lazy" width={1280} height={960} className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
        </div>
        <div>
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-4 text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">A Little More Green. <em className="italic text-primary">A Lot More Life.</em></h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Taraka Jayalakshmi Nursery began with a simple belief: everyone deserves a little nature close by. We select every plant with care and pair it with practical, friendly guidance — so it doesn't just arrive beautifully, it grows beautifully.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map(({ i: Icon, t, d }, idx) => (
              <Reveal key={t} delay={idx * 0.07} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary"><Icon className="h-5 w-5" /></span>
                <div><h3 className="text-xl text-foreground">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-12 grid grid-cols-3 divide-x divide-border border-y border-border py-6">
            {stats.map((s) => (
              <div key={s.l} className="px-3 text-center first:pl-0">
                <p className="font-serif text-4xl text-primary">{s.v}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-3 text-xs text-muted-foreground/80">Figures shown are placeholders until verified numbers are supplied.</p>
        </div>
      </div>
    </section>
  );
}
