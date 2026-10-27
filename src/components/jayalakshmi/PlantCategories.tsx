import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories, type CategoryId } from "@/data/plants";
import { Reveal, SectionHeading } from "./motion";

export function PlantCategories({ onSelect }: { onSelect: (id: CategoryId) => void }) {
  return (
    <div>
      <SectionHeading eyebrow="The collection" title={<>Explore Our <em className="italic text-primary">Plants</em></>} subtitle="Find the perfect green companions for your space and lifestyle." />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08}>
            <motion.button
              onClick={() => onSelect(c.id)}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4 }}
              className="group block w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-end justify-between gap-4 p-6">
                <div>
                  <h3 className="text-2xl text-foreground">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-primary link-underline">Explore Plants</span>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-primary transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </motion.button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
