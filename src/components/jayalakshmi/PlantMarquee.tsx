import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { LeafMark } from "./motion";

const words = ["Flowering plants", "Avenue trees", "Ornamentals", "Palms", "Fruit plants", "Succulents", "Seasonal blooms", "Hedges & creepers"];

export function PlantMarquee() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Scrolling nudges the band on top of its slow continuous drift.
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["4%", "-4%"]);

  return (
    <section ref={ref} aria-label="What we grow" className="overflow-hidden bg-primary py-7 text-primary-foreground md:py-9">
      <motion.div style={{ x }} className="marquee-mask">
        <div className={`flex w-max ${reduce ? "" : "animate-marquee"}`}>
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {words.map((w, i) => (
                <li key={w} className="flex items-center gap-6 pr-6 md:gap-10 md:pr-10">
                  <span className={`whitespace-nowrap font-serif text-2xl sm:text-3xl md:text-4xl ${i % 2 ? "italic text-sage" : ""}`}>{w}</span>
                  <LeafMark className="h-4 w-4 shrink-0 text-sage md:h-5 md:w-5" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
