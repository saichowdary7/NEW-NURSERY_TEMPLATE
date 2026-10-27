import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export function Reveal({ delay = 0, y = 28, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }: { eyebrow: string; title: React.ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">{title}</h2>
      <div className={`mt-6 flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className="h-px w-10 bg-sage" />
        <LeafMark className="h-4 w-4 text-sage" />
        <span className="h-px w-10 bg-sage" />
      </div>
      {subtitle && <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}

export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 4C11 4 5 9 5 16c0 1.5.3 2.7.8 3.7C7 13 11 9.5 16 8c-4 2.5-7.5 6-9 11.5.9.3 1.9.5 3 .5 6.5 0 10-6 10-16Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary sm:h-10 sm:w-10">
        <LeafMark className="h-5 w-5" />
      </span>
      <span className="flex flex-col text-left leading-none text-primary">
        <span className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">Taraka Jayalakshmi</span>
        <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.34em]">Nursery</span>
      </span>
    </span>
  );
}
