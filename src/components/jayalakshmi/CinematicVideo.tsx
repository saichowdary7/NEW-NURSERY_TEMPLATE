import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type MotionValue } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CinematicVideo({ src, poster, label, className = "", autoPlay = false, scale, fitY }: {
  src: string; poster: string; label: string; className?: string; autoPlay?: boolean;
  // On portrait phones, show the whole frame at this vertical position over a blurred fill.
  fitY?: string;
  // Zoom the footage only, so the play control stays inside the frame.
  scale?: MotionValue<number>;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduce || paused) { video.pause(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void video.play().catch(() => setPaused(true));
      else video.pause();
    }, { threshold: 0.05 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce, paused]);

  return (
    <>
      {fitY && <img src={poster} alt="" aria-hidden="true" className="film-backdrop" />}
      <motion.video ref={ref} style={{ ...(scale ? { scale } : {}), ...(fitY ? { "--fit-y": fitY } : {}) }} src={src} poster={poster} muted loop playsInline autoPlay={autoPlay && !reduce} preload={autoPlay ? "auto" : "metadata"}
        aria-label={label} className={`relative h-full w-full object-cover ${fitY ? "fit-film" : ""} ${className}`} />
      <Button variant="secondary" size="icon" className="absolute bottom-5 right-5 z-20 rounded-full bg-background/90 text-primary"
        aria-label={paused || reduce ? `Play ${label}` : `Pause ${label}`} title={paused || reduce ? "Play film" : "Pause film"}
        onClick={() => {
          const video = ref.current;
          if (!video) return;
          if (video.paused) { void video.play().then(() => setPaused(false)).catch(() => setPaused(true)); }
          else { video.pause(); setPaused(true); }
        }}>
        {paused || reduce ? <Play /> : <Pause />}
      </Button>
    </>
  );
}
