import { createElement, useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Loader2, Rotate3d, Smartphone, AlertTriangle, RefreshCw } from "lucide-react";
import { plants, type Plant } from "@/data/plants";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "error";
type ArState = "idle" | "unsupported" | "session-started" | "object-placed" | "failed";
type ViewerElement = HTMLElement & { loaded?: boolean; canActivateAR?: boolean; activateAR?: () => Promise<void> };

export function PlantARViewer({ plant, onBack, onSelect }: {
  plant: Plant; onBack: () => void; onSelect: (plant: Plant) => void;
}) {
  const ref = useRef<ViewerElement>(null);
  const [libReady, setLibReady] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [ar, setAr] = useState<ArState>("idle");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    import("@google/model-viewer")
      .then(() => { if (alive) setLibReady(true); })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, [attempt]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !libReady || !plant.model.glb) return;
    setStatus("loading");
    setAr("idle");
    const onLoad = () => setStatus("ready");
    const onError = () => setStatus("error");
    const onAr = (event: Event) => {
      const value = (event as CustomEvent<{ status: string }>).detail?.status;
      if (value === "session-started" || value === "object-placed" || value === "failed") setAr(value);
      if (value === "not-presenting") setAr("idle");
    };
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    el.addEventListener("ar-status", onAr);
    // Cached custom elements can finish loading before the React effect attaches.
    if (el.loaded) onLoad();
    const check = window.setInterval(() => { if (el.loaded) onLoad(); }, 500);
    const timeout = window.setTimeout(() => { if (!el.loaded) onError(); }, 45000);
    return () => {
      window.clearInterval(check);
      window.clearTimeout(timeout);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      el.removeEventListener("ar-status", onAr);
    };
  }, [libReady, plant.model.glb, attempt]);

  const launchAR = async () => {
    const el = ref.current;
    if (!el?.canActivateAR || !el.activateAR) { setAr("unsupported"); return; }
    try { await el.activateAR(); } catch { setAr("failed"); }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Button onClick={onBack} variant="link" className="px-0"><ArrowLeft /> Back to Plant Details</Button>
        {plant.model.glb && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Rotate3d className="h-4 w-4" />360° preview</span>}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Choose a plant">
        {plants.map((item) => (
          <Button key={item.id} variant="outline" onClick={() => onSelect(item)} aria-pressed={plant.id === item.id}
            aria-label={`Preview ${item.name}`} className={`h-auto flex-col whitespace-normal p-2 text-center text-xs ${plant.id === item.id ? "border-primary bg-accent" : ""}`}>
            <img src={item.image} alt="" className="h-12 w-10 rounded object-cover" />
            <span className="min-h-8 leading-4">{item.name}</span>
          </Button>
        ))}
      </div>
      <div className="relative h-[340px] shrink-0 overflow-hidden rounded-lg border border-border bg-secondary sm:h-[420px]">
        {!plant.model.glb ? (
          <img src={plant.image} alt={plant.name} className="h-full w-full object-contain" />
        ) : libReady && createElement("model-viewer", {
          key: `${plant.id}-${attempt}`, ref, src: plant.model.glb, "ios-src": plant.model.usdz,
          alt: `3D model of ${plant.name}`, ar: true, "ar-modes": "webxr scene-viewer quick-look",
          "ar-placement": "floor", "ar-scale": "auto", "camera-controls": true, "auto-rotate": true,
          "camera-orbit": "0deg 75deg auto", "camera-target": "auto auto auto", "field-of-view": "30deg",
          "touch-action": "pan-y", "shadow-intensity": "1", exposure: "1.05", "environment-image": "neutral",
          className: "absolute inset-0 h-full w-full bg-transparent",
        }, createElement("span", { slot: "ar-button", hidden: true }))}
        {plant.model.glb && status === "loading" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-secondary/80 text-sm text-muted-foreground" role="status">
            <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading {plant.name}…</span>
          </div>
        )}
        {plant.model.glb && status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-secondary p-6 text-center">
            <div><AlertTriangle className="mx-auto h-7 w-7 text-destructive" /><p className="my-3 text-sm">This plant preview couldn't load.</p>
              <Button variant="outline" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}><RefreshCw /> Try again</Button>
            </div>
          </div>
        )}
      </div>
      {plant.model.glb ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Species preview; actual plant size and shape may vary.</p>
          <Button onClick={launchAR} disabled={status !== "ready"} className="shrink-0"><Box /> Place in My Room</Button>
        </div>
      ) : <Notice icon={<Box className="h-4 w-4" />}>A matching 3D model for {plant.name} isn't available yet. Its photo is shown instead.</Notice>}
      {ar === "unsupported" && <Notice icon={<Smartphone className="h-4 w-4" />}>Room placement requires a supported phone. Open this page in Android Chrome or iPhone Safari. The 360° preview remains available here.</Notice>}
      {ar === "session-started" && <Notice icon={<Smartphone className="h-4 w-4" />}>Move your phone slowly over a well-lit floor until the plant appears.</Notice>}
      {ar === "object-placed" && <Notice icon={<Box className="h-4 w-4" />}>Plant placed in your room.</Notice>}
      {ar === "failed" && <Notice icon={<AlertTriangle className="h-4 w-4" />}>Room placement couldn't start. Check camera permission and try again on a supported phone.</Notice>}
    </div>
  );
}

function Notice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div role="status" className="mt-3 flex gap-2 rounded-lg border border-border bg-secondary p-3 text-sm text-foreground"><span className="mt-0.5 text-primary">{icon}</span><p>{children}</p></div>;
}
