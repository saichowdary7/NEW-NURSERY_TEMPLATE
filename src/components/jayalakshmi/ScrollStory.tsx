import { useEffect, useRef } from "react";
import monstera from "@/assets/monstera.jpg";
import fiddle from "@/assets/fiddle.jpg";
import peaceLily from "@/assets/peace-lily.jpg";
import about from "@/assets/about.jpg";
import { LeafMark } from "./motion";

const chapters = [
  { n: "01", t: "Discover", h: "Chosen for the way light falls in your home.", p: "Every plant is selected for health, form and character — then matched to your space.", img: monstera },
  { n: "02", t: "Preview", h: "See it in your room before you decide.", p: "Rotate any plant in 3D and place it on your floor with AR on supported phones.", img: fiddle },
  { n: "03", t: "Grow", h: "Guidance that keeps it thriving.", p: "Simple, honest care advice so your plant settles in and grows beautifully.", img: peaceLily },
];

export function ScrollStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let alive = true;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!alive || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: q(".story-pin")[0] as HTMLElement, start: "top top", end: "+=2400", scrub: 1, pin: true, anticipatePin: 1 },
        });
        tl.fromTo(q(".story-bg"), { scale: 1.25, opacity: 0.2 }, { scale: 1, opacity: 0.55, duration: 3, ease: "none" }, 0);
        q(".story-card").forEach((card, i) => {
          const at = i * 1;
          tl.fromTo(card, { z: -900, rotateX: 28, rotateY: i % 2 ? -14 : 14, opacity: 0, scale: 0.6, yPercent: 30 },
            { z: 0, rotateX: 0, rotateY: 0, opacity: 1, scale: 1, yPercent: 0, duration: 0.8, ease: "power2.out" }, at);
          if (i < 2) tl.to(card, { z: 420, opacity: 0, scale: 1.35, duration: 0.6, ease: "power1.in" }, at + 0.95);
        });
        q(".story-text").forEach((el, i) => {
          tl.fromTo(el, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5 }, i * 1 + 0.3);
          if (i < 2) tl.to(el, { opacity: 0, y: -60, duration: 0.3 }, i * 1 + 0.8);
        });
        tl.fromTo(q(".story-leaf"), { y: 200, rotate: 0 }, { y: -300, rotate: 120, stagger: 0.2, duration: 3, ease: "none" }, 0);
        tl.fromTo(q(".story-progress"), { scaleY: 0 }, { scaleY: 1, duration: 3, ease: "none" }, 0);
      });
      // mobile / reduced motion: simple reveal, no pinning
      mm.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>(root.current!.querySelectorAll(".story-m")).forEach((el) => {
          gsap.fromTo(el, { opacity: 0, y: 50, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        });
      });
      ctx = mm;
    })();
    return () => { alive = false; ctx?.revert(); };
  }, []);

  return (
    <section ref={root} aria-label="The Taraka Jayalakshmi Nursery experience" className="relative">
      {/* Desktop pinned 3D story */}
      <div className="story-pin relative hidden h-screen overflow-hidden min-[900px]:block">
        <img src={about} alt="" className="story-bg absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        {[0, 1, 2, 3].map((i) => (
          <LeafMark key={i} className={`story-leaf pointer-events-none absolute text-sage/50 ${["left-[8%] top-[70%] h-16 w-16", "left-[46%] top-[90%] h-10 w-10", "right-[6%] top-[80%] h-20 w-20", "right-[30%] top-[95%] h-8 w-8"][i]}`} />
        ))}
        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-2 items-center gap-16 px-8">
          <div className="relative h-72">
            <p className="eyebrow">The Taraka Jayalakshmi Nursery experience</p>
            <div className="absolute left-[-2rem] top-0 h-full w-px bg-border"><div className="story-progress h-full w-full origin-top bg-primary" /></div>
            {chapters.map((c) => (
              <div key={c.n} className="story-text absolute inset-x-0 top-10 opacity-0">
                <p className="font-serif text-7xl text-sage">{c.n}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-primary">{c.t}</p>
                <h2 className="mt-4 max-w-lg text-5xl leading-[1.05] text-foreground">{c.h}</h2>
                <p className="mt-5 max-w-md text-lg text-muted-foreground">{c.p}</p>
              </div>
            ))}
          </div>
          <div className="relative h-[72vh]" style={{ perspective: 1400, transformStyle: "preserve-3d" }}>
            {chapters.map((c) => (
              <div key={c.n} className="story-card absolute inset-0 mx-auto w-[78%] overflow-hidden rounded-t-[12rem] rounded-b-3xl opacity-0 shadow-soft will-change-transform">
                <img src={c.img} alt={c.t} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / reduced-motion version */}
      <div className="space-y-16 px-5 py-20 min-[900px]:hidden">
        <p className="eyebrow text-center">The Taraka Jayalakshmi Nursery experience</p>
        {chapters.map((c) => (
          <div key={c.n} className="story-m">
            <div className="overflow-hidden rounded-t-[8rem] rounded-b-3xl shadow-soft"><img src={c.img} alt={c.t} loading="lazy" className="aspect-[4/5] w-full object-cover" /></div>
            <p className="mt-6 font-serif text-5xl text-sage">{c.n}</p>
            <h2 className="mt-2 text-3xl text-foreground">{c.h}</h2>
            <p className="mt-3 text-muted-foreground">{c.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
