import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Box, Sun, Droplets } from "lucide-react";
import type { Plant } from "@/data/plants";

export function PlantCard({ plant, onOpen, onAR }: { plant: Plant; onOpen: () => void; onAR: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 150, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <button onClick={onOpen} className="block w-full text-left" aria-label={`View details for ${plant.name}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <motion.img initial={reduce ? false : { clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              src={plant.image} alt={plant.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs text-primary backdrop-blur">{plant.difficulty}</span>
          </div>
          <div className="px-6 pt-5">
            <h3 className="text-2xl text-foreground">{plant.name}</h3>
            <p className="text-sm italic text-muted-foreground">{plant.botanical}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5 text-sage" />{plant.light}</span>
              <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-sage" />{plant.suitability}</span>
            </div>
          </div>
        </button>
        <div className="flex gap-2 p-6 pt-5">
          <button onClick={onOpen} className="btn-outline !min-h-11 flex-none !px-5 text-sm">Details</button>
          <button onClick={onAR} className="btn-primary !min-h-11 flex-1 whitespace-nowrap !px-4 text-sm"><Box className="h-4 w-4" /> View in My Space</button>
        </div>
      </motion.div>
    </div>
  );
}
