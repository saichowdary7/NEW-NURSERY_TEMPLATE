import { AnimatePresence, motion } from "framer-motion";
import { categories, plants, type CategoryId, type Plant } from "@/data/plants";
import { Reveal } from "./motion";
import { PlantCard } from "./PlantCard";

export function FeaturedPlants({ filter, onFilter, onOpen }: {
  filter: CategoryId | "all";
  onFilter: (f: CategoryId | "all") => void;
  onOpen: (p: Plant, mode: "details" | "ar") => void;
}) {
  const list = filter === "all" ? plants : plants.filter((p) => p.categories.includes(filter));
  const filters: { id: CategoryId | "all"; name: string }[] = [{ id: "all", name: "All" }, ...categories];

  return (
    <div id="featured" className="scroll-mt-28">
      <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Featured plants</p>
          <h3 className="mt-3 text-4xl text-foreground sm:text-5xl">Loved by our <em className="italic text-primary">greenhouse</em></h3>
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Filter plants">
          {filters.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => onFilter(f.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${filter === f.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:bg-accent"}`}>
              {f.name}
            </button>
          ))}
        </div>
      </Reveal>
      <motion.div layout className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout style={{ perspective: 1200 }} initial={{ opacity: 0, y: 70, rotateX: 22, scale: 0.88 }} whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} viewport={{ once: true, margin: "-60px" }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45 }}>
              <PlantCard plant={p} onOpen={() => onOpen(p, "details")} onAR={() => onOpen(p, "ar")} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">No featured plants in this category yet — ask us about availability.</p>}
    </div>
  );
}
