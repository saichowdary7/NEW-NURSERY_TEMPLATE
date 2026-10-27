import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { Hand } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero3DScene = lazy(() => import("./Hero3DScene"));

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export function Hero3DPlant() {
  const reduce = !!useReducedMotion();
  const mobile = useIsMobile();
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(webglOK()), []);

  const fallback = (
    <img src={hero} alt="Monstera in a sculptural ceramic pot" width={1024} height={1280} className="h-full w-full object-cover opacity-90" fetchPriority="high" />
  );

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
      {/* arched sunlit backdrop */}
      <div className="absolute inset-x-[6%] inset-y-0 overflow-hidden rounded-t-[14rem] rounded-b-3xl shadow-soft">
        <img src={hero} alt="" width={1024} height={1280} className="h-full w-full scale-110 object-cover opacity-30 blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-beige/50 via-secondary/70 to-accent/90" />
      </div>
      <div className="absolute -inset-x-[10%] -inset-y-[6%]">
        <ClientOnly fallback={null}>
          {gl === false ? (
            <div className="absolute inset-x-[16%] inset-y-[10%] overflow-hidden rounded-t-[12rem] rounded-b-3xl">{fallback}</div>
          ) : gl ? (
            <Suspense fallback={<div className="grid h-full place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-2 border-sage border-t-primary" /></div>}>
              <Hero3DScene mobile={mobile} still={reduce} />
            </Suspense>
          ) : null}
        </ClientOnly>
      </div>
      <span className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-xs text-muted-foreground shadow-card backdrop-blur">
        <Hand className="h-3.5 w-3.5 text-primary" /> Move to explore · scroll to grow
      </span>
    </div>
  );
}
